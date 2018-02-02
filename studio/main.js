/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _DataEditor = __webpack_require__(1);
	
	var _DataEditor2 = _interopRequireDefault(_DataEditor);
	
	var _DataProperties = __webpack_require__(4);
	
	var _DataProperties2 = _interopRequireDefault(_DataProperties);
	
	var _jsreportStudio = __webpack_require__(3);
	
	var _jsreportStudio2 = _interopRequireDefault(_jsreportStudio);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	_jsreportStudio2.default.addEntitySet({
	  name: 'data',
	  faIcon: 'fa-database',
	  visibleName: 'sample data',
	  helpUrl: 'http://jsreport.net/learn/inline-data',
	  entityTreePosition: 900
	});
	
	_jsreportStudio2.default.addPropertiesComponent(_DataProperties2.default.title, _DataProperties2.default, function (entity) {
	  return entity.__entitySet === 'templates';
	});
	_jsreportStudio2.default.addEditorComponent('data', _DataEditor2.default, function (reformatter, entity) {
	  return { dataJson: reformatter(entity.dataJson, 'js') };
	});
	
	_jsreportStudio2.default.previewListeners.push(function (request, entities) {
	  if (!request.template.data || !request.template.data.shortid) {
	    return;
	  }
	
	  // try to fill request.data from the active open tab with sample data
	
	  var dataDetails = Object.keys(entities).map(function (e) {
	    return entities[e];
	  }).filter(function (d) {
	    return d.shortid === request.template.data.shortid && d.__entitySet === 'data' && (d.__isLoaded || d.__isNew);
	  });
	
	  if (!dataDetails.length) {
	    return;
	  }
	
	  request.data = dataDetails[0].dataJson || JSON.stringify({});
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _jsreportStudio = __webpack_require__(3);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var DataEditor = function (_Component) {
	  _inherits(DataEditor, _Component);
	
	  function DataEditor() {
	    _classCallCheck(this, DataEditor);
	
	    return _possibleConstructorReturn(this, (DataEditor.__proto__ || Object.getPrototypeOf(DataEditor)).apply(this, arguments));
	  }
	
	  _createClass(DataEditor, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props,
	          entity = _props.entity,
	          _onUpdate = _props.onUpdate;
	
	
	      return _react2.default.createElement(_jsreportStudio.TextEditor, {
	        name: entity._id,
	        mode: 'javascript',
	        value: entity.dataJson || '',
	        onUpdate: function onUpdate(v) {
	          return _onUpdate(Object.assign({}, entity, { dataJson: v }));
	        }
	      });
	    }
	  }]);
	
	  return DataEditor;
	}(_react.Component);
	
	exports.default = DataEditor;
	
	
	DataEditor.propTypes = {
	  entity: _react2.default.PropTypes.object.isRequired,
	  onUpdate: _react2.default.PropTypes.func.isRequired
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = Studio.libraries['react'];

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = Studio;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Properties = function (_Component) {
	  _inherits(Properties, _Component);
	
	  function Properties() {
	    _classCallCheck(this, Properties);
	
	    return _possibleConstructorReturn(this, (Properties.__proto__ || Object.getPrototypeOf(Properties)).apply(this, arguments));
	  }
	
	  _createClass(Properties, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props,
	          entity = _props.entity,
	          entities = _props.entities,
	          _onChange = _props.onChange;
	
	      var dataItems = Properties.selectDataItems(entities);
	
	      return _react2.default.createElement(
	        'div',
	        { className: 'properties-section' },
	        _react2.default.createElement(
	          'div',
	          { className: 'form-group' },
	          _react2.default.createElement(
	            'select',
	            {
	              value: entity.data ? entity.data.shortid : '',
	              onChange: function onChange(v) {
	                return _onChange({ _id: entity._id, data: v.target.value !== 'empty' ? { shortid: v.target.value } : null });
	              } },
	            _react2.default.createElement(
	              'option',
	              { key: 'empty', value: 'empty' },
	              '- not selected -'
	            ),
	            dataItems.map(function (e) {
	              return _react2.default.createElement(
	                'option',
	                { key: e.shortid, value: e.shortid },
	                e.name
	              );
	            })
	          )
	        )
	      );
	    }
	  }], [{
	    key: 'selectDataItems',
	    value: function selectDataItems(entities) {
	      return Object.keys(entities).filter(function (k) {
	        return entities[k].__entitySet === 'data';
	      }).map(function (k) {
	        return entities[k];
	      });
	    }
	  }, {
	    key: 'title',
	    value: function title(entity, entities) {
	      if (!entity.data || !entity.data.shortid) {
	        return 'data';
	      }
	
	      var foundItems = Properties.selectDataItems(entities).filter(function (e) {
	        return entity.data.shortid === e.shortid;
	      });
	
	      if (!foundItems.length) {
	        return 'data';
	      }
	
	      return 'sample data: ' + foundItems[0].name;
	    }
	  }]);
	
	  return Properties;
	}(_react.Component);
	
	exports.default = Properties;

/***/ }
/******/ ]);