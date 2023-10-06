import { BrowserWindow } from 'electron';
import { Disposable } from 'event-kit';
import type { Book, Note, NoteStatus, Tag } from 'inkdrop-model';
import React from 'react';

declare global {
    var inkdrop: Inkdrop.Environment; // eslint-disable-line no-var
}

declare namespace Inkdrop {
    /**
     * https://docs.inkdrop.app/reference/environment
     */
    interface Environment {
        commands: CommandRegistry;
        components: ComponentManager;
        config: Config;
        contextMenu: unknown;
        devMode: boolean;
        element: unknown;
        keymaps: KeymapManager;
        layouts: LayoutManager;
        main: InkdropApplication;
        menu: MenuManager;
        notifications: NotificationManager;
        packages: PackageManager;
        resourcePath: string;
        themes: unknown;
        styles: unknown;
        store: Store;
        window: BrowserWindow;

        onEditorLoad(callback: (e: MarkdownEditor) => void): Disposable;
        onEditorUnload(callback: () => void): Disposable;
        onAppReady(callback: () => void): Disposable;
        onAppQuit(callback: () => void): Disposable;

        isEditorActive(): boolean;
        getActiveEditor(): MarkdownEditor;
        getActiveEditorOrThrowError(): MarkdownEditor;
        setActiveEditor(editor: MarkdownEditor): void;
    }

    /**
     * https://docs.inkdrop.app/reference/mde
     */
    interface MarkdownEditor {
        cm: CodeMirror.Editor;
        wrapper: React.Component;
    }

    /**
     * https://docs.inkdrop.app/reference/command-registry
     */
    interface CommandRegistry {
        add<T>(target: HTMLElement, commandName: string, callback: (event: CustomEvent<T>) => void): Disposable;
        add(target: HTMLElement, commands: { [index: string]: (event: CustomEvent<any>) => void }): Disposable; // eslint-disable-line @typescript-eslint/no-explicit-any
        dispatch<T>(target: HTMLElement | Element, commandName: string, detail?: T): void;
    }

    /**
     * https://docs.inkdrop.app/reference/component-manager
     */
    interface ComponentManager {
        classes: ComponentClasses;
        registerClass(klass: typeof React.Component, klassName?: string): void;
        deleteClass(klass: typeof React.Component, klassName?: string): void;
        getComponentClass(klassName: string): void;
    }

    /**
     * https://docs.inkdrop.app/reference/components
     */
    interface ComponentClasses {
        Dialog: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        MessageDialog: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        NotebookListBar: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        StreamlineIcon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    /**
     * https://docs.inkdrop.app/reference/config
     */
    interface Config {
        configDirPath: string;
        get(): { [index: string]: { [index: string]: string | number | boolean | undefined } | undefined };
        get(configName: string): string | number | boolean | undefined;
        set(configName: string, value: string | number | boolean): void;
        observe(configName: string, callback: (newValue: string | number | boolean) => void): Disposable;
        onDidChange(configName: string, callback: (oldValue: string | number | boolean, newValue: string | number | boolean) => void): Disposable;
    }

    type KeyBinding = {
        command: string;
        index: number;
        keystrokeArray: Array<string>;
        keystrokeCount: number;
        priority: number;
        selector: string;
        source: string;
        specificity: number;
        keystrokes: string;
    };

    /**
     * https://docs.inkdrop.app/reference/keymap-manager
     */
    interface KeymapManager {
        build(source: string, bindings: { [index: string]: { [index: string]: string } }, priority: number);
        add(source: string, bindings: { [index: string]: { [index: string]: string } }, priority: number);
        removeBindingsFromSource(source: string);
        getKeyBindings(): Array<KeyBinding>;
        findKeyBindings(params: { keystrokes: string; command: string; target: HTMLElement }): Array<KeyBinding>;
        keyBindings: Array<KeyBinding>;
    }

    /**
     * https://docs.inkdrop.app/reference/layout-manager
     */
    interface LayoutManager {
        onLayoutChange(name: string, callback: (components: Array<string>) => void): Disposable;

        addComponentToLayout(layoutName: string, componentClassName: string): void;
        insertComponentToLayoutBefore(layoutName: string, referenceComponentClassName: string, componentClassNameToInsert: string): void;
        insertComponentToLayoutAfter(layoutName: string, referenceComponentClassName: string, componentClassNameToInsert: string): void;
        getLayout(name: string): Array<string>;
        getLayoutComponents(name: string): Array<React.Component>;
        indexOfComponentInLayout(layoutName: string, componentClassName: string): number;
        removeComponentFromLayout(layoutName: string, componentClassName: string): void;
        setLayout(name: string, components: Array<string>): void;
    }

    /**
     * https://docs.inkdrop.app/reference/inkdrop-application
     */
    interface InkdropApplication {
        dataStore: DataStore;
        version: string;
    }

    /**
     * https://docs.inkdrop.app/reference/data-store
     */
    interface DataStore {
        localPouch: PouchDB.Database | undefined;
        local: InkdropDatabase | undefined;
        sync: unknown;
        getLocalDB(): InkdropDatabase;
        updateFTSIndex(): void;
    }

    /**
     * https://docs.inkdrop.app/reference/inkdrop-database
     */
    interface InkdropDatabase {
        notes: DBNote;
        books: DBBook;
        tags: DBTag;
        files: DBFiles;
        utils: DBUtils;

        onChange(callback: (change: PouchDB.Core.ChangesResponseChange<object>) => void): Disposable;
        onNoteChange(callback: (change: PouchDB.Core.ChangesResponseChange<Note>) => void): Disposable;
        onBookChange(callback: (change: PouchDB.Core.ChangesResponseChange<Book>) => void): Disposable;
        onTagChange(callback: (change: PouchDB.Core.ChangesResponseChange<Tag>) => void): Disposable;
        onFullTextIndexBuildStart(callback: () => void): Disposable;
        onFullTextIndexBuildEnd(callback: () => void): Disposable;
        onFullTextIndexBuildError(callback: () => void): Disposable;
    }

    type DBNoteSearchOptions = {
        sort?: Array<{ [index in 'title' | 'updatedAt' | 'createdAt']: 'asc' | 'desc' | undefined }>;
        limit?: number;
        skip?: number;
    };
    type DBNoteFindOptions = DBNoteSearchOptions & {
        includeDocs?: boolean;
    };
    type DBNoteResult = {
        query: unknown;
        totalRows: number;
        cursor: unknown;
        includeDocs: boolean;
        docs: Note[];
    };
    /**
     * https://docs.inkdrop.app/reference/db-note
     */
    interface DBNote {
        createId(): string;
        validateDocId(docId: string): boolean;
        put(doc: Note): Promise<PouchDB.Core.Response>;
        get(docId: string, options?: PouchDB.Core.GetOptions): Promise<Note>;
        remove(docId: string): Promise<PouchDB.Core.Response>;
        removeBatch(docIds: Array<string>): Promise<Array<PouchDB.Core.Response>>;
        countAll(): Promise<number>;
        all(options?: DBNoteFindOptions): Promise<DBNoteResult>;
        findInBook(bookId: string, options: DBNoteFindOptions): Promise<DBNoteResult>;
        findWithTag(tagId: string, options: DBNoteFindOptions): Promise<DBNoteResult>;
        findWithStatus(statue: NoteStatus, options: DBNoteFindOptions): Promise<DBNoteResult>;
    }

    /**
     * https://docs.inkdrop.app/reference/db-book
     */
    interface DBBook {
        createId(): string;
        validateDocId(docId: string): boolean;
        put(doc: Book): Promise<PouchDB.Core.Response>;
        get(docId: string, options?: PouchDB.Core.GetOptions): Promise<Book>;
        remove(docId: string): Promise<PouchDB.Core.Response>;
        countAll(): Promise<number>;
        all(): Promise<Array<Book>>;
        findWithName(name: string): Promise<Book | undefined>;
    }

    /**
     * https://docs.inkdrop.app/reference/db-tag
     */
    interface DBTag {
        createId(): string;
        validateDocId(docId: string): boolean;
        put(doc: Tag): Promise<PouchDB.Core.Response>;
        get(docId: string, options?: PouchDB.Core.GetOptions): Promise<Tag>;
        remove(docId: string): Promise<PouchDB.Core.Response>;
        countAll(): Promise<number>;
        all(): Promise<Array<Tag>>;
        findWithName(name: string): Promise<Tag | undefined>;
    }

    /**
     * https://docs.inkdrop.app/reference/db-file
     */
    interface DBFiles {
        createId(): string;
        validateDocId(docId: string): boolean;
        put(doc: File): Promise<PouchDB.Core.Response>;
        get(docId: string, options?: PouchDB.Core.GetOptions): Promise<File>;
        remove(docId: string): Promise<PouchDB.Core.Response>;
        countAll(): Promise<number>;
        all(): Promise<Array<File>>;
    }

    type DBUtilsSearchResult = {
        query: unknown;
        cursor: unknown;
        includeDocs: boolean;
        docs: Note[];
    };
    /**
     * https://docs.inkdrop.app/reference/db-utils
     */
    interface DBUtils {
        search(keyword: string, options?: DBNoteSearchOptions): Promise<DBUtilsSearchResult>;
        countNotesWithTag(tagId: string): Promise<number>;
        deleteTag(tagId: string): Promise<void>;
        moveNoteToBook(noteId: string, moveToBookId: string): Promise<void>;
        moveNoteToBookBatch(noteIds: Array<string>, moveToBookId: string): Promise<void>;
        duplicateNote(noteId: string): Promise<Note>;
        duplicateNoteBatch(noteIds: Array<string>): Promise<Array<Note>>;
        moveNotesToTrashOrDelete(noteIds: Array<string>): Promise<void>;
        emptyTrash(): Promise<void>;
        setTagsBatch(noteIds: Array<string>, tags: Array<string>): Promise<Array<Note>>;
        setStatusBatch(noteIds: Array<string>, status: NoteStatus): Promise<void>;
        moveBook(bookId: string, newParentBookId: string | null): Promise<Book>;
        deleteBook(bookId: string): Promise<void>;
        getBufferFromFile(fileId: string): Promise<Buffer>;
    }

    type MenuItem = {
        label: string;
        submenu?: Array<MenuItem>;
        command?: string;
    };
    /**
     * https://docs.inkdrop.app/reference/menu-manager
     */
    interface MenuManager {
        add(items: Array<MenuItem>): Disposable;
        update(): void;
    }

    type NotificationOptions = {
        dismissable?: boolean;
        detail?: string;
    };
    /**
     * https://docs.inkdrop.app/reference/notification-manager
     */
    interface NotificationManager {
        onDidAddNotification(callback: (notification: Notification) => void): Disposable;
        onDidClearNotifications(callback: () => void): Disposable;

        addSuccess(message: string, options?: NotificationOptions): Notification;
        addInfo(message: string, options?: NotificationOptions): Notification;
        addWarning(message: string, options?: NotificationOptions): Notification;
        addError(message: string, options?: NotificationOptions): Notification;
        addFatalError(message: string, options?: NotificationOptions): Notification;

        getNotifications(): Array<Notification>;
    }

    /**
     * https://docs.inkdrop.app/reference/notification
     */
    interface Notification {
        onDidDismiss(callback: () => void): Disposable;
        onDidDisplay(callback: () => void): Disposable;

        getType(): string;
        getMessage(): string;
        dismiss(): void;
    }

    /**
     * https://docs.inkdrop.app/reference/package-manager
     */
    interface PackageManager {
        onDidLoadInitialPackages(callback: () => void): Disposable;
        onDidActivateInitialPackages(callback: () => void): Disposable;
        onDidActivatePackage(callback: (package: Package) => void): Disposable;
        onDidDeactivatePackage(callback: (package: Package) => void): Disposable;
        onDidLoadPackage(callback: (package: Package) => void): Disposable;
        onDidUnloadPackage(callback: (package: Package) => void): Disposable;

        getIpmPath(): string;
        getPackageDirPaths(): Array<string>;

        resolvePackagePath(name: string): string;
        isBundledPackage(name: string): boolean;

        enablePackage(name: string): Package | null;
        disablePackage(name: string): Package | null;
        isPackageDisabled(name: string): boolean;

        getActivePackages(): Array<Package>;
        getActivePackage(name: string): Package | undefined;
        isPackageActive(name: string): boolean;

        getLoadedPackages(): Array<Package>;
        getLoadedPackage(name: string): Package | undefined;
        isPackageLoaded(name: string): boolean;

        getAvailablePackagePaths(): Array<string>;
        getAvailablePackageNames(): Array<string>;
        getAvailablePackageMetadata(): Array<unknown>;
    }

    /**
     * https://docs.inkdrop.app/reference/package
     */
    interface Package {
        onDidDeactivate(callback: () => void): Disposable;

        isCompatible(): boolean;
    }

    /**
     * https://docs.inkdrop.app/reference/environment#store
     */
    interface Store {
        getState(): State;
        subscribe(handleChange: () => void): () => void;
    }

    interface State {
        appState: unknown;
        appWindow: unknown;
        assistiveError: unknown;
        autoUpdate: unknown;
        availablePlugins: unknown;
        bookList: unknown;
        books: unknown;
        config: unknown;
        db: unknown;
        editingNote: Note;
        editor: unknown;
        ipmTasks: unknown;
        layouts: unknown;
        localConfig: unknown;
        mainLayout: unknown;
        navigation: NavigationState;
        noteListBar: unknown;
        notes: NotesState;
        preferences: unknown;
        preview: unknown;
        queryContext: unknown;
        searchBar: unknown;
        session: unknown;
        sidebar: unknown;
        stats: unknown;
        tags: unknown;
    }

    interface NavigationState {
        history: Array<NavigationStateHistory>;
        offset: number;
    }

    interface NavigationStateHistory {
        editingNote: string;
        queryContext: unknown;
        sidebar: unknown;
    }

    interface NotesState {
        cursor: unknown;
        hashedItems: { [index: string]: Note };
        items: Array<Note>;
        lastError?: unkown;
        lastQuery: unknown;
        loading: boolean;
        timestamp: number;
        totalRows: number;
    }
}
