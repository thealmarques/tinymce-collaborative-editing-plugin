import { Editor } from 'tinymce';
import { SocketCursor } from '../interfaces/cursor.interfaces';
import { SocketSelection } from '../interfaces/selection.interfaces';
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
    this.myUser = user;

    this.io = require("socket.io-client");

    this.ioClient = this.io.connect("http://localhost:3000", {
      query: `name=${user.name}&photoUrl=${user.photoUrl}`
    });

    this.ioClient.on('update_clients', (array: []) => {
      const map = new Map(array);
      map.forEach((value: User, key: number) => {
        if (user.name !== value.name) {
          this.setUser(value);
        }
      });
    });

    this.ioClient.on('delete_client', (user: User) => {
      this.removeUser(user);
    });

    this.ioClient.on('update_cursor', (obj: string) => {
      const parsedObj: SocketCursor = JSON.parse(obj);
      if (parsedObj.user.name !== this.myUser.name) {
        this.deleteUserInteractions(parsedObj.user);
        const appendRange = new Range();
        const node: HTMLElement = <HTMLElement>this.editor.getDoc().querySelector('.mce-content-body').children[parsedObj.nodeIndex];

        const textNode: Node = this.findTextNode(node, parsedObj.content);
        let offset = 0;
        if (parsedObj.range.endOffset > textNode.textContent.length) {
          offset++;
        }

        appendRange.setStart(textNode, parsedObj.range.startOffset - offset);
        appendRange.setEnd(textNode, parsedObj.range.endOffset - offset);

        this.moveCursor(appendRange, parsedObj.user, node);
      } 
    });

    this.ioClient.on('update_selection', (obj: string) => {
      const parsedObj: SocketSelection = JSON.parse(obj);
      if (parsedObj.user.name !== this.myUser.name) {
        this.deleteUserInteractions(parsedObj.user);
        
        const appendRange = new Range();
        const startNode: HTMLElement = <HTMLElement>this.editor.getDoc().querySelector('.mce-content-body').children[parsedObj.startNodeIndex];
        const endNode: HTMLElement = <HTMLElement>this.editor.getDoc().querySelector('.mce-content-body').children[parsedObj.endNodeIndex];
        const startTextContent = this.findTextNode(startNode, parsedObj.startContent);
        const endTextContent = this.findTextNode(endNode, parsedObj.endContent);

        let startOffset = 0;
        if (parsedObj.range.startOffset > startTextContent.textContent.length) {
          startOffset++;
        }

        let endOffset = 0;
        if (parsedObj.range.endOffset > endTextContent.textContent.length) {
          endOffset++;
        }

        appendRange.setStart(startTextContent, parsedObj.range.startOffset - startOffset);
        appendRange.setEnd(endTextContent, parsedObj.range.endOffset - endOffset);

        this.selections.set(this.hash(user.name), {
          range: appendRange, user: parsedObj.user
        });

        this.moveSelection(Array.from(appendRange.getClientRects()), parsedObj.user);
      } 
    });

    this.ioClient.on('update_content', (content: string) => {
      if (content !== this.editor.getContent()) {
        this.editor.setContent(content);
      }
    });
  }

  /**
   * Finds the desired node in the editor where the content equals the given parameter.
   * @param node Search node
   * @param content Content of the node
   */
  findTextNode(node: HTMLElement, content: string) {
    let textNode: Node;
    if (node.textContent.trim() === content.trim() && node.childNodes.length === 0) {
      return node;
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      const currentNode = node.childNodes[i];
      if (currentNode.textContent.trim() === content.trim() && currentNode.childNodes.length === 0) {
        return currentNode;
      }

      textNode = this.findTextNode(<HTMLElement>currentNode, content);

      if (textNode) {
        return textNode;
      }
    }

    return textNode;
  }

  /**
   * Removes user from TinyMCE Editor
   */
  removeUser(user: User) {
    this.deleteUserInteractions(user);
    const userContainer: HTMLElement = document.querySelector(this.editor.getParam('selector')).parentElement.querySelector('#user-container');
    userContainer.querySelector(`#container-${this.hash(user.name)}`).remove();
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

    if (user.photoUrl && user.photoUrl.length > 0 && user.photoUrl !== 'undefined') {
      const avatar = document.createElement('img');
      avatar.id = `avatar-${user.name}`;
      avatar.src = user.photoUrl;
      avatar.style.height = '38px';
      avatar.style.width = '35px';
      avatar.style.borderRadius = '35px';
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
    text.style.zIndex = '10';

    container.appendChild(text);

    const userContainer: HTMLElement = document.querySelector(this.editor.getParam('selector')).parentElement.querySelector('#user-container');
    userContainer.appendChild(container);
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

    let startNode: Node = range.startContainer;

    while (startNode.parentElement.id !== 'tinymce') {
      startNode = startNode.parentElement;
    }

    let sibling: Node = startNode.previousSibling;
    let startIndex = 0;
    while (sibling !== null) {
      startIndex++;
      sibling = sibling.previousSibling;
    }

    let endNode: Node = range.endContainer;
    while (endNode.parentElement.id !== 'tinymce') {
      endNode = endNode.parentElement;
    }
    
    let endIndex = 0;
    sibling = endNode.previousSibling;
    while (sibling !== null) {
      endIndex++;
      sibling = sibling.previousSibling;
    };

    this.deleteUserInteractions(user);

    if (range.startOffset === range.endOffset) {
      this.ioClient.emit('set_cursor', JSON.stringify({
        range: range,
        user,
        nodeIndex: startIndex,
        content: range.startContainer.textContent
      }));
    } else {
      this.ioClient.emit('set_selection', JSON.stringify({
        range: range,
        startNodeIndex: startIndex,
        endNodeIndex: endIndex,
        user,
        startContent: range.startContainer.textContent,
        endContent: range.endContainer.textContent
      }));
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
   * @param range Range selection
   * @param user User
   */
  private moveCursor(range: Range, user: User, node: HTMLElement): void {
    const userId = this.hash(user.name);
    const bounding = range.getBoundingClientRect();

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
    cursorBar.style.height = bounding.height ? bounding.height + 'px' : '1em';
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

    if (bounding.top === 0) {
      cursor.style.top = node.offsetTop + 'px';
      cursor.style.left = '1em';
    } else {
      cursor.style.top = this.editor.getDoc().children[0].scrollTop + bounding.top + 'px';
      cursor.style.left = bounding.left + 'px';
    }

    const body: HTMLElement = this.editor.getDoc().body;
    body.parentElement.insertBefore(cursor, body);

    this.cursors.set(userId, { range, node });
    this.selections.delete(userId);
  }

  /**
   * Moves selection to desired lines
   * @param event Event
   * @param range Range selection
   * @param user User
   */
  private moveSelection(ranges: DOMRect[], user: User): void {
    const body: HTMLElement = this.editor.getDoc().body;
    const selectionId = `selection-${this.hash(user.name)}`;

    for (let i = 0; i < ranges.length; i++) {
      const selection = document.createElement('span');
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

    this.cursors.delete(this.hash(user.name));
  }

  /**
   * On Resize Event
   * @param event Event
   */
  onResize(event: Event): void {
    this.cursors.forEach(({ range, node }, key) => {
      const element: HTMLDivElement = this.editor.getDoc().querySelector(`#cursor-${key}`);
      const bounding = range.getBoundingClientRect();
      if (bounding.top === 0) {
        element.style.top = node.offsetTop + 'px';
        element.style.left = '1em';
      } else {
        element.style.top = this.editor.getDoc().children[0].scrollTop + bounding.top + 'px';
        element.style.left = bounding.left + 'px';
      }
    });

    this.selections.forEach(({ range, user }, key: number) => {
      this.deleteUserInteractions(user);
      this.moveSelection(Array.from(range.getClientRects()), user);
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

  /**
   * Text editor content change event
   * @param event Default TinyMCE Event
   */
  updateContent(event: Event) {
    this.ioClient.emit('set_content', this.editor.getContent());
  }
}