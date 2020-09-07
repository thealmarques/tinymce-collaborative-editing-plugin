/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/demo/ts/Demo.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/demo/ts/Demo.ts":
/*!*****************************!*\
  !*** ./src/demo/ts/Demo.ts ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _main_ts_Plugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../main/ts/Plugin */ "./src/main/ts/Plugin.ts");

Object(_main_ts_Plugin__WEBPACK_IMPORTED_MODULE_0__["default"])();
tinymce.init({
    selector: 'textarea.tinymce',
    plugins: 'code budwriter',
    budwriter: {
        name: 'Andre',
        photoUrl: 'https://www.biggalyoga.com/wp-content/uploads/2018/07/profilecircle-768x814.png',
        key: 'free4all'
    },
    toolbar: 'budwriter',
    height: "600",
    branding: false
});


/***/ }),

/***/ "./src/main/ts/Plugin.ts":
/*!*******************************!*\
  !*** ./src/main/ts/Plugin.ts ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core_collaborative__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/collaborative */ "./src/main/ts/core/collaborative.ts");

var user;
tinymce.create('tinymce.plugins.Budwriter', {
    Budwriter: function (editor, url) {
        var collaborativeEditing = new _core_collaborative__WEBPACK_IMPORTED_MODULE_0__["CollaborativeEditing"](editor);
        editor.on('Load', function (event) {
            var textEditor = document.querySelector('.tinymce');
            textEditor.parentElement.onresize = function (event) { collaborativeEditing.onResize(event); };
            user = JSON.parse(JSON.stringify(editor.getParam('budwriter')));
            collaborativeEditing.setUser(user);
        });
        editor.on('click', function (event) {
            collaborativeEditing.onListen(event, user);
        });
        editor.on('keyup', function (event) {
            collaborativeEditing.onListen(event, user);
        });
    }
});
/* harmony default export */ __webpack_exports__["default"] = (function () {
    tinymce.PluginManager.add('budwriter', tinymce.plugins.Budwriter);
});


/***/ }),

/***/ "./src/main/ts/core/collaborative.ts":
/*!*******************************************!*\
  !*** ./src/main/ts/core/collaborative.ts ***!
  \*******************************************/
/*! exports provided: CollaborativeEditing */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CollaborativeEditing", function() { return CollaborativeEditing; });
var CollaborativeEditing = /** @class */ (function () {
    function CollaborativeEditing(editor) {
        this.editor = editor;
        this.cursors = new Map();
        this.selections = new Map();
        this.colors = new Map();
    }
    /**
     * Sets a user in the tinymce editor
     */
    CollaborativeEditing.prototype.setUser = function (user) {
        var exists = true;
        var _loop_1 = function () {
            var randomColor = this_1.getRandomColor();
            var isColorPresent = false;
            this_1.colors.forEach(function (color, key) {
                if (randomColor === color) {
                    isColorPresent = true;
                }
            });
            if (!isColorPresent) {
                this_1.colors.set(user.name, randomColor);
                return "break";
            }
        };
        var this_1 = this;
        while (exists) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
        var container = document.createElement('div');
        container.id = "container-" + this.hash(user.name);
        container.style.display = 'flex';
        container.style.position = 'relative';
        container.style.cursor = 'pointer';
        container.style.width = '35px';
        container.style.alignItems = 'center';
        container.addEventListener("mouseover", function (event) {
            event.target.children[1].style.visibility = 'visible';
        });
        container.addEventListener("mouseout", function (event) {
            event.target.children[1].style.visibility = 'hidden';
        });
        if (user.photoUrl && user.photoUrl.length > 0) {
            var avatar = document.createElement('img');
            avatar.id = "avatar-" + user.name;
            avatar.src = user.photoUrl;
            avatar.style.height = '38px';
            avatar.style.width = '35px';
            avatar.style.borderRadius = '35px';
            avatar.style.marginBottom = '10px';
            avatar.style.pointerEvents = 'none';
            container.appendChild(avatar);
        }
        else {
            var avatar = document.createElement('div');
            avatar.id = "avatar-" + user.name;
            avatar.style.height = '30px';
            avatar.style.width = '30px';
            avatar.style.borderRadius = '30px';
            avatar.style.backgroundColor = this.colors.get(user.name);
            avatar.style.pointerEvents = 'none';
            avatar.style.textAlign = 'center';
            avatar.style.color = 'white';
            avatar.style.opacity = '70%';
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
            avatar.style.marginBottom = '10px';
            avatar.innerText = user.name.charAt(0);
            container.appendChild(avatar);
        }
        var text = document.createElement('span');
        text.id = "text-" + user.name;
        text.textContent = user.name;
        text.style.visibility = 'hidden';
        text.style.position = 'absolute';
        text.style.pointerEvents = 'none';
        text.style.verticalAlign = 'center';
        text.style.backgroundColor = this.colors.get(user.name);
        text.style.opacity = '70%';
        text.style.color = 'white';
        text.style.fontSize = '9px';
        text.style.paddingTop = '9px';
        text.style.paddingBottom = '9px';
        text.style.width = user.name.length * 7 + 'px';
        text.style.textAlign = 'center';
        text.style.left = '35px';
        text.style.borderRadius = '5px';
        text.style.marginBottom = '10px';
        container.appendChild(text);
        var textEditor = document.querySelector('.tinymce');
        textEditor.parentElement.insertBefore(container, textEditor);
    };
    /**
     * Listens all kinds of input in editor
     * 1. Keyboard
     * 2. Copy paste
     * 3. Up/Down
     */
    CollaborativeEditing.prototype.onListen = function (event, user) {
        var selection = this.editor.getDoc().getSelection();
        var range = selection.getRangeAt(0);
        this.deleteUserInteractions(user);
        if (range.startOffset === range.endOffset) {
            this.moveCursor(event, range, user);
        }
        else {
            this.moveSelection(event, range, user);
        }
    };
    /**
     * Removes user cursor or selections
     * @param user User
     */
    CollaborativeEditing.prototype.deleteUserInteractions = function (user) {
        var cursor = this.editor.getDoc().querySelector("#cursor-" + this.hash(user.name));
        if (cursor) {
            cursor.remove();
        }
        var selections = this.editor.getDoc().querySelectorAll("#selection-" + this.hash(user.name));
        if (selections && selections.length > 0) {
            selections.forEach(function (selection) {
                selection.remove();
            });
        }
    };
    /**
     * Moves cursor to desired position
     * @param event Event
     * @param range Range selection
     * @param user User
     */
    CollaborativeEditing.prototype.moveCursor = function (event, range, user) {
        var node = this.editor.selection.getNode();
        var userId = this.hash(user.name);
        var cursorId = "cursor-" + userId;
        var cursor = document.createElement('div');
        cursor.id = cursorId;
        cursor.style.position = 'absolute';
        cursor.style.zIndex = '-1';
        cursor.style.position = 'block';
        var cursorBar = document.createElement('div');
        cursorBar.style.backgroundColor = this.colors.get(user.name);
        cursorBar.style.opacity = '60%';
        cursorBar.style.width = '2.5px';
        cursorBar.style.height = range.getBoundingClientRect().height + 'px';
        cursorBar.style.position = 'relative';
        var cursorText = document.createElement('span');
        cursorText.style.backgroundColor = this.colors.get(user.name);
        cursorText.style.color = 'white';
        cursorText.style.fontSize = '10px';
        cursorText.style.height = '12px';
        cursorText.textContent = user.name;
        cursorText.style.position = 'absolute';
        cursorText.style.top = '-12px';
        cursorBar.appendChild(cursorText);
        cursor.appendChild(cursorBar);
        if (range.getBoundingClientRect().top === 0) {
            cursor.style.top = node.offsetTop + 'px';
            cursor.style.left = '1em';
        }
        else {
            cursor.style.top = this.editor.getDoc().children[0].scrollTop + range.getBoundingClientRect().top + 'px';
            cursor.style.left = range.getBoundingClientRect().left + 'px';
        }
        var body = this.editor.getDoc().body;
        body.parentElement.insertBefore(cursor, body);
        this.cursors.set(userId, { range: range.cloneRange(), node: node });
        this.selections.delete(userId);
    };
    /**
     * Moves selection to desired lines
     * @param event Event
     * @param range Range selection
     * @param user User
     */
    CollaborativeEditing.prototype.moveSelection = function (event, range, user) {
        var body = this.editor.getDoc().body;
        var selectionId = "selection-" + this.hash(user.name);
        var ranges = range.getClientRects();
        for (var i = 0; i < ranges.length; i++) {
            var selection = document.createElement('span');
            selection.id = selectionId;
            selection.style.backgroundColor = this.colors.get(user.name);
            selection.style.opacity = '50%';
            selection.style.position = 'absolute';
            selection.style.width = ranges[i].width + 'px';
            selection.style.height = ranges[i].height + 'px';
            selection.style.top = ranges[i].y + 'px';
            selection.style.left = ranges[i].x + 'px';
            selection.style.zIndex = '-1';
            if (i === 0) {
                var selectionText = document.createElement('span');
                selectionText.style.backgroundColor = this.colors.get(user.name);
                selectionText.style.color = 'white';
                selectionText.style.fontSize = '10px';
                selectionText.style.height = '14px';
                selectionText.textContent = user.name;
                selectionText.style.position = 'absolute';
                selectionText.style.top = '-14px';
                selection.appendChild(selectionText);
            }
            body.parentElement.insertBefore(selection, body);
        }
        this.selections.set(this.hash(user.name), {
            range: range, user: user
        });
        this.cursors.delete(this.hash(user.name));
    };
    /**
     * On Resize Event
     * @param event Event
     */
    CollaborativeEditing.prototype.onResize = function (event) {
        var _this = this;
        this.cursors.forEach(function (_a, key) {
            var range = _a.range, node = _a.node;
            var element = _this.editor.getDoc().querySelector("#cursor-" + key);
            if (range.getBoundingClientRect().top === 0) {
                element.style.top = node.offsetTop + 'px';
                element.style.left = '1em';
            }
            else {
                element.style.top = _this.editor.getDoc().children[0].scrollTop + range.getBoundingClientRect().top + 'px';
                element.style.left = range.getBoundingClientRect().left + 'px';
            }
        });
        this.selections.forEach(function (_a, key) {
            var range = _a.range, user = _a.user;
            _this.deleteUserInteractions(user);
            _this.moveSelection(null, range, user);
        });
    };
    /**
     * Basic hash function
     * @param username User name
     */
    CollaborativeEditing.prototype.hash = function (username) {
        var hash = 0;
        if (username.length == 0) {
            return hash;
        }
        for (var i = 0; i < username.length; i++) {
            var char = username.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    };
    /**
     * Generates random color when user enters the application
     */
    CollaborativeEditing.prototype.getRandomColor = function () {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    return CollaborativeEditing;
}());



/***/ })

/******/ });
//# sourceMappingURL=demo.js.map