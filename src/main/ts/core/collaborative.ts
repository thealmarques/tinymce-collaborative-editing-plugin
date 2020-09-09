import { Editor } from 'tinymce';
import { User } from '../interfaces/user.interfaces';

export class CollaborativeEditing {
  /**
   * TinyMCE default editor
   */
  editor: Editor;

  /**
   * Socket IO
   */
  io: SocketIOClientStatic;
  ioClient: SocketIOClient.Socket;

  /**
   * Real time
   */
  myUser: User;
  users: User[];
  cursors: Map<number, {
    range: Range,
    node: HTMLElement
  }>;
  selections: Map<number, {
    user: User,
    range: Range
  }>;
  colors: Map<string, string>;
  

  constructor(editor: Editor, user: User) {
    this.editor = editor;

    this.cursors = new Map();
    this.selections = new Map();
    this.colors = new Map();

    this.io = require("socket.io-client");
    this.ioClient = this.io.connect("http://localhost:3000", {
      query: `name=${user.name}&photoUrl=${user.photoUrl}`
    });

    this.ioClient.on('register_client', (user: User) => {
      this.setUser(user);
    });
  }

  /**
   * Sets a user in the tinymce editor
   */
  setUser(user: User) {
    const exists = true;
    while (exists) {
      const randomColor = this.getRandomColor();
      let isColorPresent = false;
      this.colors.forEach((color, key) => {
        if (randomColor === color) {
          isColorPresent = true;
        }
      });
      if (!isColorPresent) {
        this.colors.set(user.name, randomColor);
        break;
      }
    }

    const container = document.createElement('div');
    container.id = `container-${this.hash(user.name)}`
    container.style.display = 'inline-flex';
    container.style.position = 'relative';
    container.style.cursor = 'pointer';
    container.style.width = '35px';
    container.style.alignItems = 'center';

    container.addEventListener("mouseover", (event: Event & { target: HTMLElement }) => {
      (event.target.children[1] as HTMLElement).style.visibility = 'visible';
    });

    container.addEventListener("mouseout", (event: Event & { target: HTMLElement }) => {
      (event.target.children[1] as HTMLElement).style.visibility = 'hidden';
    });

    if (user.photoUrl && user.photoUrl.length > 0) {
      const avatar = document.createElement('img');
      avatar.id = `avatar-${user.name}`;
      avatar.src = user.photoUrl;
      avatar.style.height = '38px';
      avatar.style.width = '35px';
      avatar.style.borderRadius = '35px';
      avatar.style.marginBottom = '10px';
      avatar.style.pointerEvents = 'none';

      container.appendChild(avatar);
    } else {
      const avatar = document.createElement('div');
      avatar.id = `avatar-${user.name}`;
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

    const text = document.createElement('span');
    text.id = `text-${user.name}`;
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
    text.style.marginBottom = '10px';
    text.style.zIndex = '10';

    container.appendChild(text);

    const textEditor: HTMLElement = document.querySelector('.tinymce');
    textEditor.parentElement.insertBefore(container, textEditor);
  }

  /**
   * Listens all kinds of input in editor
   * 1. Keyboard
   * 2. Copy paste
   * 3. Up/Down
   */
  onListen(event: Event, user: User): void {
    let selection: Selection = this.editor.getDoc().getSelection();
    let range: Range = selection.getRangeAt(0);

    this.deleteUserInteractions(user);

    if (range.startOffset === range.endOffset) {
      this.moveCursor(event, range, user);
    } else {
      this.moveSelection(event, range, user);
    }
  }

  /**
   * Removes user cursor or selections
   * @param user User
   */
  private deleteUserInteractions(user: User) {
    const cursor: HTMLDivElement = this.editor.getDoc().querySelector(`#cursor-${this.hash(user.name)}`);
    if (cursor) {
      cursor.remove();
    }

    const selections = this.editor.getDoc().querySelectorAll(`#selection-${this.hash(user.name)}`);
    if (selections && selections.length > 0) {
      selections.forEach((selection) => {
        selection.remove();
      });
    }
  }

  /**
   * Moves cursor to desired position
   * @param event Event
   * @param range Range selection
   * @param user User
   */
  private moveCursor(event: Event, range: Range, user: User): void {
    let node: HTMLElement = <HTMLElement>this.editor.selection.getNode();
    const userId = this.hash(user.name);

    const cursorId = `cursor-${userId}`;
    let cursor: HTMLDivElement = document.createElement('div');
    cursor.id = cursorId;
    cursor.style.position = 'absolute';
    cursor.style.zIndex = '-1';
    cursor.style.position = 'block';

    const cursorBar: HTMLDivElement = document.createElement('div')
    cursorBar.style.backgroundColor = this.colors.get(user.name);
    cursorBar.style.opacity = '60%';
    cursorBar.style.width = '2.5px';
    cursorBar.style.height = range.getBoundingClientRect().height + 'px';
    cursorBar.style.position = 'relative';

    const cursorText: HTMLSpanElement = document.createElement('span')
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
    } else {
      cursor.style.top = this.editor.getDoc().children[0].scrollTop + range.getBoundingClientRect().top + 'px';
      cursor.style.left = range.getBoundingClientRect().left + 'px';
    }

    const body: HTMLElement = this.editor.getDoc().body;
    body.parentElement.insertBefore(cursor, body);

    this.cursors.set(userId, { range: range.cloneRange(), node });
    this.selections.delete(userId);
  }

  /**
   * Moves selection to desired lines
   * @param event Event
   * @param range Range selection
   * @param user User
   */
  private moveSelection(event: Event, range: Range, user: User): void {
    const body: HTMLElement = this.editor.getDoc().body;

    const selectionId = `selection-${this.hash(user.name)}`;
    const ranges = range.getClientRects();

    for (let i = 0; i < ranges.length; i++) {
      const selection = document.createElement('span');
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
        const selectionText: HTMLSpanElement = document.createElement('span')
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
      range, user
    });
    this.cursors.delete(this.hash(user.name));
  }

  /**
   * On Resize Event
   * @param event Event
   */
  onResize(event: Event): void {
    this.cursors.forEach(({ range, node }, key) => {
      const element: HTMLDivElement = this.editor.getDoc().querySelector(`#cursor-${key}`);
      if (range.getBoundingClientRect().top === 0) {
        element.style.top = node.offsetTop + 'px';
        element.style.left = '1em';
      } else {
        element.style.top = this.editor.getDoc().children[0].scrollTop + range.getBoundingClientRect().top + 'px';
        element.style.left = range.getBoundingClientRect().left + 'px';
      }
    });

    this.selections.forEach(({ range, user }, key: number) => {
      this.deleteUserInteractions(user);
      this.moveSelection(null, range, user);
    });
  }

  /**
   * Basic hash function
   * @param username User name
   */
  private hash(username: string): number {
    let hash = 0;
    if (username.length == 0) {
      return hash;
    }
    for (var i = 0; i < username.length; i++) {
      var char = username.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  /**
   * Generates random color when user enters the application
   */
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}