import { Editor } from 'tinymce';
import { User } from '../interfaces/user.interfaces';
export declare class CollaborativeEditing {
    /**
     * TinyMCE default editor
     */
    private editor;
    /**
     * Socket IO
     */
    private io;
    private ioClient;
    /**
     * Real time
     */
    private myUser;
    private cursors;
    private selections;
    private colors;
    constructor(editor: Editor, user: User);
    /**
     * On Resize Event
     * @param event Event
     */
    onResize(): void;
    /**
     * Text editor content change event
     * @param event Default TinyMCE Event
     */
    updateContent(event: Event): void;
    /**
     * Sets a user in the tinymce editor
     */
    setUser(user: User): void;
    /**
     * Listens all kinds of input in editor
     * 1. Keyboard
     * 2. Copy paste
     * 3. Up/Down
     */
    onListen(event: Event, user: User): void;
    /**
     * Finds the desired node in the editor where the content equals the given parameter.
     * @param node Search node
     * @param content Content of the node
     */
    private findTextNode;
    /**
     * Removes user from TinyMCE Editor
     */
    private removeUser;
    /**
     * Removes user cursor or selections
     * @param user User
     */
    private deleteUserInteractions;
    /**
     * Moves cursor to desired position
     * @param range Range selection
     * @param user User
     */
    private moveCursor;
    /**
     * Moves selection to desired lines
     * @param event Event
     * @param range Range selection
     * @param user User
     */
    private moveSelection;
    /**
     * Basic hash function
     * @param username User name
     */
    private hash;
    /**
     * Generates random color when user enters the application
     */
    private getRandomColor;
}
