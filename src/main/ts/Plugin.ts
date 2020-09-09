import { Editor } from 'tinymce';
import { CollaborativeEditing } from './core/collaborative';
import { User } from './interfaces/user.interfaces';

declare const tinymce: any;
let user: User;

tinymce.create('tinymce.plugins.Budwriter', {
  Budwriter: (editor: Editor, url: string) => {
    user = JSON.parse(JSON.stringify(editor.getParam('budwriter')));
    const collaborativeEditing = new CollaborativeEditing(editor, user);
    editor.on('Load', function (event: Event) {
      const textEditor: HTMLElement = document.querySelector('.tinymce');
      textEditor.parentElement.onresize = (event: Event) => { collaborativeEditing.onResize(event); }

      collaborativeEditing.setUser(user);
    });

    editor.on('click', (event: Event) => {
      collaborativeEditing.onListen(event, user);
    });

    editor.on('keyup', (event: Event) => {
      collaborativeEditing.onListen(event, user);
    });
  }
});

export default () => {
  tinymce.PluginManager.add('budwriter', tinymce.plugins.Budwriter);
};
