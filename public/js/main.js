define('data.model',["app", "core/basicModel"], function(app, ModelBase) {

    return ModelBase.extend({
        odata: "data",
        url: "odata/data",

        toString: function() {
            return "Data Item " + (this.get("name") || "");
        }
    });
});
define('data.list.model',["app", "backbone", "core/dataGrid", "data.model"], function (app, Backbone, DataGrid, DataModel) {
    return Backbone.Collection.extend({

        url: function() {
            var qs =  this.filter.toOData();
            qs.$orderby = "modificationDate desc";
            return "odata/data?" + $.param(qs);
        },

        initialize: function () {
            var self = this;
            this.filter = new DataGrid.Filter.Base();
            this.filter.bind("apply", function () {
                self.fetch();
            });
        },
        
        parse: function (data) {
            if (this.meta && this.meta["@odata.count"])
                this.filter.set("totalCount", this.meta["@odata.count"]);

            return data;
        },

        model: DataModel
    });
});




define('data.list.view',["marionette", "core/dataGrid", "core/view.base"], function (Marionette, DataGrid, ViewBase) {
    return ViewBase.extend({
        template: "data-list",

        initialize: function () {
            this.listenTo(this.collection, "sync", this.render);
            this.listenTo(this.collection, "remove", this.render);
        },

        onDomRefresh: function () {
            this.dataGrid = DataGrid.show({
                collection: this.collection,
                filter: this.collection.filter,
                idKey: "shortid",
                onShowDetail: function (id) {
                    window.location.hash = "extension/data/detail/" + id;
                },
                el: $("#schemaGridBox"),
                headerTemplate: "data-list-header",
                rowsTemplate: "data-list-rows"
            });
        }
    });
}); 
define('data.list.toolbar.view',["jquery", "app", "core/utils", "core/view.base", "underscore"],
    function ($, app, Utils, LayoutBase) {
        return LayoutBase.extend({
            template: "data-list-toolbar",
            
            initialize: function () {
            },
         
            
            events: {
                "click #deleteCommand": "deleteCommand"
            },
            
            deleteCommand: function() {
                this.contentView.dataGrid.deleteItems();
            }
        });
    });


define('data.detail.view',["marionette", "core/view.base", "core/aceBinder"], function(Marionette, ViewBase, aceBinder) {
    return ViewBase.extend({
        template: "data-detail",

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "sync", self.render);
        },

        onDomRefresh: function() {

            var top = $("#contentWrap").position().top;

            this.contentEditor = ace.edit("contentArea");
            this.contentEditor.setTheme("ace/theme/chrome");
            this.contentEditor.getSession().setMode("ace/mode/json");
            this.contentEditor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true
            });
                
            aceBinder(this.model, "dataJson", this.contentEditor);

            $("#contentArea").css("margin-top", top);
        },

        validateLeaving: function() {
            return !this.model.hasChangesSyncLastSync();
        }
    });
});
define('data.template.view',["app", "marionette", "underscore",  "core/view.base", "core/utils"], function(app, Marionette, _, ViewBase, Utils) {
    return ViewBase.extend({
        tagName: "li",
        template: "data-template-extension-standard",
         
        initialize: function() {
            _.bindAll(this, "isFilled", "getItems", "getItemsLength");
        },

        isFilled: function() {
            return this.model.get("shortid") || this.model.get("dataJson");
        },
        
        getItems: function () {
            return this.model.items;
        },
        
        getItemsLength: function () {
            return this.model.items.length;
        },
        
        onClose: function() {
            this.model.templateModel.unbind("api-overrides", this.model.apiOverride, this.model);
        }
    });
});
define('data.toolbar.view',["marionette", "jquery", "app", "core/utils", "core/view.base"],
    function(Marionette, $, app, Utils, LayoutBase) {
        return LayoutBase.extend({
            template: "data-toolbar",

            initialize: function() {
                var self = this;
                $(document).on('keydown.data-detail', this.hotkey.bind(this));

                this.listenTo(this, "render", function() {
                    var contextToolbar = {
                        name: "data-detail",
                        model: self.model,
                        region: self.extensionsToolbarRegion,
                        view: self
                    };
                    app.trigger("toolbar-render", contextToolbar);
                });
            },

            events: {
                "click #saveCommand": "save"
            },

            regions: {
                extensionsToolbarRegion: {
                    selector: "#extensionsToolbarBox",
                    regionType: Marionette.MultiRegion
                }
            },

            save: function() {
                if (!this.validate())
                    return;

                var self = this;
                this.model.save({}, {
                    success: function() {
                        app.trigger("data-saved", self.model);
                    }
                });
            },

            hotkey: function(e) {
                if (e.ctrlKey && e.which === 83) {
                    this.save();
                    e.preventDefault();
                    return false;
                }
            },

            onValidate: function() {
                var res = [];

                if (this.model.get("name") == null || this.model.get("name") === "")
                    res.push({
                        message: "Name cannot be empty"
                    });

                try {
                    var json = JSON.parse(this.model.get("dataJson"));
                } catch(e) {
                    res.push({
                        message: "Data must be valid JSON. e.g. { \"propertName\": \"propertyValue\"} <br/>" + e.toString()
                    });
                }

                return res;
            },

            onClose: function() {
                $(document).off(".data-detail");
            }
        });
    });
define('data.template.model',["app", "core/basicModel", "underscore", "jquery"], function (app, ModelBase, _, $) {
   
    return ModelBase.extend({
        
        fetch: function (options) {
            var self = this;

            function processItems(items) {
                self.items = items;

                var data = self.templateModel.get("data");

                if (!data) {
                    data = {};

                    //back compatibility
                    if (self.templateModel.get("dataItemId")) {
                        data.shortid = self.templateModel.get("dataItemId");
                    }

                    self.templateModel.set("data", data);
                }
                var custom;
                if (app.options.data.allowCustom) {
                    custom = {name: "- custom -", shortid: "custom", dataJson: data.dataJson};
                    self.items.unshift(custom);
                }

                var empty = { name: "- not selected -", shortid: null };
                self.items.unshift(empty);

                if (!data.dataJson && !data.shortid)
                    self.set(custom || empty, { silent: true });

                if (data.shortid) {
                    self.set(_.findWhere(self.items, {shortid: data.shortid}), {silent: true});
                }

                if (data.dataJson)
                    self.set(custom || empty, { silent: true });

                return $.Deferred().resolve();
            }

            if (app.options.data.allowSelection) {
                return app.dataProvider.get("odata/data?$select=name,shortid").then(processItems);
            } else {
                return processItems([]);
            }
        },

        setTemplate: function (templateModel) {
            this.templateModel = templateModel;
            this.listenTo(templateModel, "api-overrides", this.apiOverride);
        },
        
        apiOverride: function(req) {
            req.template.data = { "shortid": this.get("shortid") || "...", "dataJson": "{\'foo\' : \'...\' }" };
        },

        initialize: function () {
            var self = this;

            this.listenTo(this, "change:shortid", function() {
                self.templateModel.get("data").shortid = self.get("shortid") !== "custom" ? self.get("shortid") : undefined;
                self.templateModel.get("data").dataJson = self.get("shortid") === "custom" ? self.get("dataJson") : undefined;
                self.set(_.findWhere(self.items, { shortid: self.get("shortid")}));
            });

            this.listenTo(this, "change:dataJson", function() {
                if (self.get("shortid") === "custom") {
                    self.templateModel.get("data").dataJson = self.get("dataJson");
                    _.findWhere(self.items, { shortid: "custom" }).dataJson = self.get("dataJson");
                }
            });
        }
    });
});
define(["app", "marionette", "backbone",
        "data.list.model", "data.list.view", "data.list.toolbar.view",
        "data.model", "data.detail.view",
        "data.template.view",
        "data.toolbar.view", "data.template.model"],
    function (app, Marionette, Backbone, DataListModel, DataListView, DataListToolbarView, DataModel, DataDetailView,
              TemplateStandardView, ToolbarView, TemplateStandardModel) {

        app.options.data = app.options.data || { allowSelection: true, allowCustom: false};

        app.module("data", function (module) {
            var Router = Backbone.Router.extend({
                initialize: function () {
                    app.listenTo(app, "data-saved", function (model) {
                        window.location.hash = "/extension/data/detail/" + model.get("shortid");
                    });
                },

                routes: {
                    "extension/data/list": "data",
                    "extension/data/detail/:id": "dataDetail",
                    "extension/data/detail": "dataDetail"
                },

                data: function () {
                    this.navigate("/extension/data/list");

                    var model = new DataListModel();
                    app.layout.showToolbarViewComposition(new DataListView({ collection: model }), new DataListToolbarView({ collection: model }));
                    model.fetch();
                },

                dataDetail: function (id) {
                    var model = new DataModel();
                    app.layout.showToolbarViewComposition(new DataDetailView({ model: model }), new ToolbarView({ model: model }));

                    if (id != null) {
                        model.set("shortid", id);
                        model.fetch();
                    }
                }
            });

            app.data.on("created", function () {
                app.data.router.data();
            });

            app.data.router = new Router();


            app.on("menu-render", function (context) {
                context.result += "<li><a href='#/extension/data/list'>Data</a></li>";
            });

            app.on("menu-actions-render", function (context) {
                context.result += "<li><a id='createDataCommand' href='#/extension/data/detail' class='validate-leaving'>Create Data</a></li>";
            });


            app.on("template-extensions-render", function (context) {

                var model = new TemplateStandardModel();
                model.setTemplate(context.template);

                model.fetch().then(function () {
                    var view = new TemplateStandardView({ model: model});
                    context.extensionsRegion.show(view, "data");
                });
            });
        });
    });
