var setup = function (editor, url) {
    editor.ui.registry.addButton('budwriter', {
        text: 'budwriter button',
        onAction: function () {
            // tslint:disable-next-line:no-console
            editor.setContent('<p>content added from budwriter</p>');
        }
    });
};
export default (function () {
    tinymce.PluginManager.add('budwriter', setup);
});
//# sourceMappingURL=Plugin.js.map