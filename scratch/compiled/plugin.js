(function () {
    'use strict';

    var setup = function (editor, url) {
      editor.ui.registry.addButton('budwriter', {
        text: 'budwriter button',
        onAction: function () {
          editor.setContent('<p>content added from budwriter</p>');
        }
      });
    };
    function Plugin () {
      tinymce.PluginManager.add('budwriter', setup);
    }

    Plugin();

}());
