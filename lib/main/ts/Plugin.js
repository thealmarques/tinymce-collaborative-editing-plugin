import { CollaborativeEditing } from './core/collaborative';
var collaborativeMap = new Map();
tinymce.create('tinymce.plugins.Budwriter', {
    Budwriter: function (editor, url) {
        editor.on('Load', function () {
            var textEditor = document.querySelector(editor.getParam('selector'));
            var userContainer = document.createElement('div');
            userContainer.id = 'user-container';
            userContainer.style.display = 'flex';
            userContainer.style.alignItems = 'center';
            userContainer.style.marginBottom = '10px';
            textEditor.parentElement.insertBefore(userContainer, textEditor);
            var user = JSON.parse(JSON.stringify(editor.getParam('budwriter')));
            var edit = new CollaborativeEditing(editor, user);
            collaborativeMap.set(editor.getParam('selector'), edit);
            edit.setUser(user);
            window.onresize = function (event) {
                edit.onResize();
            };
        });
        editor.on('click', function (event) {
            var user = JSON.parse(JSON.stringify(editor.getParam('budwriter')));
            collaborativeMap.get(editor.getParam('selector')).onListen(event, user);
        });
        editor.on('NodeChange', function (event) {
            var colab = collaborativeMap.get(editor.getParam('selector'));
            var user = JSON.parse(JSON.stringify(editor.getParam('budwriter')));
            if (colab) {
                colab.updateContent(event);
                colab.onListen(event, user);
            }
        });
        editor.on('input', function (event) {
            var colab = collaborativeMap.get(editor.getParam('selector'));
            var user = JSON.parse(JSON.stringify(editor.getParam('budwriter')));
            if (colab) {
                colab.updateContent(event);
                colab.onListen(event, user);
            }
        });
    }
});
export default (function () {
    tinymce.PluginManager.add('budwriter', tinymce.plugins.Budwriter);
});
//# sourceMappingURL=Plugin.js.map