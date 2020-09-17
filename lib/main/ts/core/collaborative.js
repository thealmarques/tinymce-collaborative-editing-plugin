var CollaborativeEditing = /** @class */ (function () {
    function CollaborativeEditing(editor, user) {
        var _this = this;
        this.editor = editor;
        this.cursors = new Map();
        this.selections = new Map();
        this.colors = new Map();
        this.myUser = user;
        this.io = require('socket.io-client');
        this.ioClient = this.io.connect(user.socketUrl, {
            query: "name=" + user.name + "&photoUrl=" + user.photoUrl
        });
        this.ioClient.on('update_clients', function (array) {
            var map = new Map(array);
            map.forEach(function (value, key) {
                if (user.name !== value.name) {
                    _this.setUser(value);
                }
            });
        });
        this.ioClient.on('delete_client', function (disconnected) {
            _this.removeUser(disconnected);
        });
        this.ioClient.on('update_cursor', function (obj) {
            var parsedObj = JSON.parse(obj);
            if (parsedObj.user.name !== _this.myUser.name) {
                _this.deleteUserInteractions(parsedObj.user);
                var appendRange = new Range();
                var node = _this.editor.getDoc().querySelector('.mce-content-body').children[parsedObj.nodeIndex];
                var textNode = _this.findTextNode(node, parsedObj.content);
                var offset = 0;
                if (parsedObj.range.endOffset > textNode.textContent.length) {
                    offset++;
                }
                appendRange.setStart(textNode, parsedObj.range.startOffset - offset);
                appendRange.setEnd(textNode, parsedObj.range.endOffset - offset);
                _this.moveCursor(appendRange, parsedObj.user, node);
            }
        });
        this.ioClient.on('update_selection', function (obj) {
            var parsedObj = JSON.parse(obj);
            if (parsedObj.user.name !== _this.myUser.name) {
                _this.deleteUserInteractions(parsedObj.user);
                var appendRange = new Range();
                var startNode = _this.editor.getDoc().querySelector('.mce-content-body').children[parsedObj.startNodeIndex];
                var endNode = _this.editor.getDoc().querySelector('.mce-content-body').children[parsedObj.endNodeIndex];
                var startTextContent = _this.findTextNode(startNode, parsedObj.startContent);
                var endTextContent = _this.findTextNode(endNode, parsedObj.endContent);
                if (!endTextContent) {
                    endTextContent = startTextContent;
                }
                var startOffset = 0;
                if (parsedObj.range.startOffset > startTextContent.textContent.length) {
                    startOffset++;
                }
                var endOffset = 0;
                if (parsedObj.range.endOffset > endTextContent.textContent.length) {
                    endOffset++;
                }
                appendRange.setStart(startTextContent, parsedObj.range.startOffset - startOffset);
                appendRange.setEnd(endTextContent, parsedObj.range.endOffset - endOffset);
                _this.selections.set(_this.hash(user.name), {
                    range: appendRange, user: parsedObj.user
                });
                _this.moveSelection(Array.from(appendRange.getClientRects()), parsedObj.user);
            }
        });
        this.ioClient.on('update_content', function (message) {
            if (message.username !== _this.myUser.name) {
                _this.editor.setContent(message.content);
            }
        });
    }
    /**
     * On Resize Event
     * @param event Event
     */
    CollaborativeEditing.prototype.onResize = function () {
        var _this = this;
        this.cursors.forEach(function (_a, key) {
            var range = _a.range, node = _a.node;
            var element = _this.editor.getDoc().querySelector("#cursor-" + key);
            var bounding = range.getBoundingClientRect();
            if (bounding.top === 0) {
                element.style.top = node.offsetTop + 'px';
                element.style.left = '1em';
            }
            else {
                element.style.top = _this.editor.getDoc().children[0].scrollTop + bounding.top + 'px';
                element.style.left = bounding.left + 'px';
            }
        });
        this.selections.forEach(function (_a, key) {
            var range = _a.range, user = _a.user;
            _this.deleteUserInteractions(user);
            _this.moveSelection(Array.from(range.getClientRects()), user);
        });
    };
    /**
     * Text editor content change event
     * @param event Default TinyMCE Event
     */
    CollaborativeEditing.prototype.updateContent = function (event) {
        this.ioClient.emit('set_content', {
            username: this.myUser.name,
            content: this.editor.getContent()
        });
        this.onResize();
    };
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
        container.style.display = 'inline-flex';
        container.style.position = 'relative';
        container.style.cursor = 'pointer';
        container.style.width = '35px';
        container.style.alignItems = 'center';
        container.addEventListener('mouseover', function (event) {
            event.target.children[1].style.visibility = 'visible';
        });
        container.addEventListener('mouseout', function (event) {
            event.target.children[1].style.visibility = 'hidden';
        });
        if (user.photoUrl && user.photoUrl.length > 0 && user.photoUrl !== 'undefined') {
            var avatar = document.createElement('img');
            avatar.id = "avatar-" + user.name;
            avatar.src = user.photoUrl;
            avatar.style.height = '38px';
            avatar.style.width = '35px';
            avatar.style.borderRadius = '35px';
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
        text.style.opacity = '85%';
        text.style.color = 'white';
        text.style.fontSize = '9px';
        text.style.paddingTop = '9px';
        text.style.paddingBottom = '9px';
        text.style.width = user.name.length * 7 + 'px';
        text.style.textAlign = 'center';
        text.style.left = '35px';
        text.style.borderRadius = '5px';
        text.style.zIndex = '10';
        container.appendChild(text);
        var userContainer = document.querySelector(this.editor.getParam('selector')).parentElement.querySelector('#user-container');
        userContainer.appendChild(container);
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
        Object.defineProperties(range, {
            startOffset: {
                value: range.startOffset,
                enumerable: true
            },
            endOffset: {
                value: range.endOffset,
                enumerable: true
            }
        });
        var startNode = range.startContainer;
        while (startNode.parentElement.id !== 'tinymce') {
            startNode = startNode.parentElement;
        }
        var sibling = startNode.previousSibling;
        var startIndex = 0;
        while (sibling !== null) {
            startIndex++;
            sibling = sibling.previousSibling;
        }
        var endNode = range.endContainer;
        while (endNode.parentElement.id !== 'tinymce') {
            endNode = endNode.parentElement;
        }
        var endIndex = 0;
        sibling = endNode.previousSibling;
        while (sibling !== null) {
            endIndex++;
            sibling = sibling.previousSibling;
        }
        this.deleteUserInteractions(user);
        if (range.startOffset === range.endOffset) {
            this.ioClient.emit('set_cursor', JSON.stringify({
                range: range,
                user: user,
                nodeIndex: startIndex,
                content: range.startContainer.textContent
            }));
        }
        else {
            this.ioClient.emit('set_selection', JSON.stringify({
                range: range,
                startNodeIndex: startIndex,
                endNodeIndex: endIndex,
                user: user,
                startContent: range.startContainer.textContent,
                endContent: range.endContainer.textContent
            }));
        }
    };
    /**
     * Finds the desired node in the editor where the content equals the given parameter.
     * @param node Search node
     * @param content Content of the node
     */
    CollaborativeEditing.prototype.findTextNode = function (node, content) {
        var textNode;
        if (node.textContent.trim().indexOf(content.trim()) > -1 && node.childNodes.length === 0) {
            return node;
        }
        for (var _i = 0, _a = Array.from(node.childNodes); _i < _a.length; _i++) {
            var currentNode = _a[_i];
            if (currentNode.textContent.trim().indexOf(content.trim()) > -1 && currentNode.childNodes.length === 0) {
                return currentNode;
            }
            textNode = this.findTextNode(currentNode, content);
            if (textNode) {
                return textNode;
            }
        }
        return textNode;
    };
    /**
     * Removes user from TinyMCE Editor
     */
    CollaborativeEditing.prototype.removeUser = function (user) {
        this.deleteUserInteractions(user);
        var userContainer = document.querySelector(this.editor.getParam('selector')).parentElement.querySelector('#user-container');
        userContainer.querySelector("#container-" + this.hash(user.name)).remove();
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
     * @param range Range selection
     * @param user User
     */
    CollaborativeEditing.prototype.moveCursor = function (range, user, node) {
        var userId = this.hash(user.name);
        var bounding = range.getBoundingClientRect();
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
        cursorBar.style.height = bounding.height ? bounding.height + 'px' : '1em';
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
        if (bounding.top === 0) {
            cursor.style.top = node.offsetTop + 'px';
            cursor.style.left = '1em';
        }
        else {
            cursor.style.top = this.editor.getDoc().children[0].scrollTop + bounding.top + 'px';
            cursor.style.left = bounding.left + 'px';
        }
        var body = this.editor.getDoc().body;
        body.parentElement.insertBefore(cursor, body);
        this.cursors.set(userId, { range: range, node: node });
        this.selections.delete(userId);
    };
    /**
     * Moves selection to desired lines
     * @param event Event
     * @param range Range selection
     * @param user User
     */
    CollaborativeEditing.prototype.moveSelection = function (ranges, user) {
        var body = this.editor.getDoc().body;
        var selectionId = "selection-" + this.hash(user.name);
        for (var i = 0; i < ranges.length; i++) {
            var selection = document.createElement('span');
            selection.id = selectionId;
            selection.style.backgroundColor = this.colors.get(user.name);
            selection.style.opacity = '50%';
            selection.style.position = 'absolute';
            selection.style.width = ranges[i].width + 'px';
            selection.style.height = ranges[i].height + 'px';
            selection.style.top = ranges[i].y + this.editor.getBody().parentElement.scrollTop + 'px';
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
        this.cursors.delete(this.hash(user.name));
    };
    /**
     * Basic hash function
     * @param username User name
     */
    CollaborativeEditing.prototype.hash = function (username) {
        var hash = 0;
        if (username.length === 0) {
            return hash;
        }
        for (var i = 0; i < username.length; i++) {
            var char = username.charCodeAt(i);
            /* tslint:disable:no-bitwise */
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
            /* tslint:enable:no-bitwise */
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
export { CollaborativeEditing };
//# sourceMappingURL=collaborative.js.map