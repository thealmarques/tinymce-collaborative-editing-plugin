import { Editor } from 'tinymce';
import { CollaborativeEditing } from './core/collaborative';
import { User } from './interfaces/user.interfaces';

declare const tinymce: any;
let collaborativeMap: Map<string, CollaborativeEditing> = new Map();

tinymce.create('tinymce.plugins.Budwriter', {
  Budwriter: (editor: Editor, url: string) => {
    editor.on('Load', () => {
      const textEditor: HTMLElement = document.querySelector(editor.getParam('selector'));

      const userContainer = document.createElement('div');
      userContainer.id = 'user-container';
      userContainer.style.display = 'flex';
      userContainer.style.alignItems = 'center';
      userContainer.style.marginBottom = '10px';
      textEditor.parentElement.insertBefore(userContainer, textEditor);

      const user: User = JSON.parse(JSON.stringify(editor.getParam('budwriter')));
      const edit = new CollaborativeEditing(editor, user);
      collaborativeMap.set(editor.getParam('selector'), edit);
      edit.setUser(user);
      window.onresize = (event: Event) => {
        edit.onResize();
      }
    });

    editor.on('click', (event: Event) => {
      const user: User = JSON.parse(JSON.stringify(editor.getParam('budwriter')));
      collaborativeMap.get(editor.getParam('selector')).onListen(event, user);
    });

    editor.on('keyup', (event: Event) => {
      const user: User = JSON.parse(JSON.stringify(editor.getParam('budwriter')));
      collaborativeMap.get(editor.getParam('selector')).updateContent(event);

      collaborativeMap.get(editor.getParam('selector')).onListen(event, user);
    });

    editor.on('NodeChange', (event: Event) => {
      const colab = collaborativeMap.get(editor.getParam('selector'));
      if (colab) {
      colab.updateContent(event);
      }
    });
  }
});

export default () => {
  tinymce.PluginManager.add('budwriter', tinymce.plugins.Budwriter);
};
