import type {
	ButtonComponent,
	App,
	Component,
	EventRef,
	FileStats,
	IconName,
	Scope,
	TAbstractFile,
	TFile,
	TFolder,
	TooltipOptions,
	Vault,
	CloseableComponent,
} from "obsidian";

import { Mock, vi } from "vitest";

export abstract class MockTAbstractFile {
	vault: Vault;
	path: string;
	name: string;
	parent: MockTFolder | null;

	constructor(vault: Vault, path: string, parent: MockTFolder | null) {
		const nameIndex = path.lastIndexOf("/");
		const name = path.substring(nameIndex + 1);

		this.vault = vault;
		this.path = path;
		this.name = name;
		this.parent = parent;
	}
}

export class MockTFolder extends MockTAbstractFile {
	children: TAbstractFile[] = [];

	constructor(
		vault: Vault,
		path: string,
		parent: MockTFolder | null = null,
		children: TAbstractFile[] = []
	) {
		super(vault, path, parent);
		this.children = children;
		this.path = path + "/";
	}

	isRoot(): boolean {
		return this.name === "/" && this.path === "/";
	}
}

export class MockTFile extends MockTAbstractFile {
	stat: FileStats;
	basename: string;
	extension: string;
	_content: string;

	constructor(
		vault: Vault,
		path: string,
		content: string = "",
		parent: MockTFolder | null = null
	) {
		super(vault, path, parent);

		const endIndex = this.name.lastIndexOf(".");
		const basename = this.name.substring(0, endIndex);
		const extension = this.name.substring(endIndex + 1);

		this.stat = { ctime: 0, mtime: 0, size: 0 };
		this.basename = basename;
		this.extension = extension;
		this._content = content;
	}
}

type MockVaultEvents = {
	create: (file: TAbstractFile) => any;
	modify: (file: TAbstractFile) => any;
	delete: (file: TAbstractFile) => any;
	rename: (file: TAbstractFile, oldPath: string) => any;
};

type MockVaultEventRecord = {
	[K in keyof MockVaultEvents]: MockVaultEvents[K][];
};

type MockEventRef = { callback: VoidFunction } & EventRef;

export class MockVault {
	_files: Record<string, MockTAbstractFile> = {};
	_cache: Record<string, string> = {};
	_events: MockVaultEventRecord = {
		create: [],
		delete: [],
		modify: [],
		rename: [],
	};

	constructor(initialFiles: Record<string, MockTAbstractFile> = {}) {
		this._files = initialFiles;
	}

	getFiles = vi.fn(() => {
		return Object.values(this._files)
			.map((file) => file)
			.filter((value): value is MockTFile => value instanceof MockTFile);
	});

	getMarkdownFiles = vi.fn(() => {
		return this.getFiles().filter((file) => file.extension == "md");
	});

	process = vi.fn(async (file: TFile, func: (data: string) => string) => {
		const content = await this.read(file);
		const data = func(content);
		await this.write(file, data);
		return data;
	});

	read = vi.fn(async (file: TFile) => {
		if (!(file instanceof MockTFile)) {
			throw new Error("can only read files");
		}

		this._cache[file.path] = file._content;
		return file._content ?? "";
	});

	write = vi.fn(async (file: TFile, data: string) => {
		const isCreation = this._files[file.path] === undefined;

		const mockFile = file as MockTFile;
		mockFile._content = data;

		this._cache[file.path] = data;

		if (isCreation) {
			this.emitEvent("create", file);
		} else {
			this.emitEvent("modify", file);
		}
	});

	create = vi.fn(async (path, data: string) => {
		const file = new MockTFile(this.asVault(), path, data);
		this._files[path] = file;
		this._cache[file.path] = data;
		this.emitEvent("create", file);
	});

	cachedRead = vi.fn(async (file: TFile) => {
		if (!(file instanceof MockTFile)) {
			throw new Error("can only read files");
		}

		if (this._cache[file.path]) {
			return this._cache[file.path];
		}

		return await this.read(file);
	});

	addFile(path: string, value: string): TFile {
		const file = new MockTFile(this.asVault(), path, value);

		const nameIndex = path.lastIndexOf("/");
		const folderPath = path.substring(0, nameIndex);

		const folder = this._files[folderPath];

		if (folder && folder instanceof MockTFolder) {
			folder.children.push(file);
		}

		this._files[path] = file;

		this.emitEvent("create", file);

		return file;
	}

	addFolder(path: string): TFolder {
		const file = new MockTFolder(this.asVault(), path);
		this._files[path] = file;

		this.emitEvent("create", file);

		return file;
	}

	modify(path: string) {
		const file = this._files[path];
		if (!file) return;

		this.emitEvent("modify", file);
	}

	removeFile(path: string) {
		if (this._files[path] !== undefined) {
			const file = this._files[path];
			this.emitEvent("delete", file);
			delete this._files[path];
		}
	}

	renameFile(path: string, newPath: string) {
		if (this._files[path] !== undefined) {
			const file = this._files[path];
			this._files[newPath] = file;
			delete this._files[path];

			const nameIndex = newPath.lastIndexOf("/");
			const name = newPath.substring(nameIndex);

			file.path = newPath;
			file.name = name;

			if (file instanceof MockTFile) {
				const endIndex = name.lastIndexOf(".");
				const basename = name.substring(0, endIndex);
				const extension = name.substring(endIndex + 1);

				file.basename = basename;
				file.extension = extension;
			}

			this.emitEvent("rename", file, path);
		}
	}

	asVault(): Vault {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return this as any as Vault;
	}

	private emitEvent<K extends keyof MockVaultEvents>(
		name: K,
		...args: Parameters<MockVaultEvents[K]>
	) {
		if (!this._events[name]) return;

		for (const callback of this._events[name]) {
			callback.call(this, ...args);
		}
	}

	on = vi.fn(
		<K extends keyof MockVaultEvents>(
			name: K,
			callback: MockVaultEvents[K],
			_ctx?: any
		): EventRef => {
			const currentSet = this._events[name] ?? (this._events[name] = []);
			currentSet.push(callback);
			return {
				callback: () => {
					const updated = this._events[name]?.filter((other) => other !== callback);
					this._events[name] = updated as any;
				},
			} as MockEventRef;
		}
	);
}

export class MockComponent {
	private children: Component[] = [];
	private loaded = false;
	private callbacks: VoidFunction[] = [];

	constructor() {}

	load() {
		if (this.loaded) {
			return;
		}

		this.loaded = true;
		this.onload();
		this.children.forEach((c) => c.load());
	}

	unload() {
		if (!this.loaded) {
			return;
		}

		this.loaded = false;

		this.children.forEach((c) => c.unload());

		for (const callback of this.callbacks) {
			callback();
		}

		this.onunload();
	}

	onload() {}
	onunload() {}

	registerEvent(eventRef: EventRef) {
		this.callbacks.push(() => {
			const ref = eventRef as MockEventRef;
			ref.callback();
		});
	}

	register(callback: VoidFunction) {
		this.callbacks.push(callback);
	}

	registerInterval(intervalID: number) {
		this.callbacks.push(() => {
			clearInterval(intervalID);
		});
	}

	registerDomEvent(
		el: any,
		type: string,
		callback: (this: any, ev: any) => any,
		options?: boolean | AddEventListenerOptions
	) {
		const listener = (event: any) => {
			callback.call(el, event);
		};

		el.addEventListener(type, listener, options);

		this.callbacks.push(() => {
			el.removeEventListener(type, listener, options);
		});
	}

	addChild(child: Component) {
		this.children.push(child);
		if (this.loaded) child.load();
	}

	removeChild(child: Component) {
		this.children = this.children.filter((c) => c !== child);
		child.unload();
	}
}

abstract class MockBaseComponent {
	disabled: boolean;

	// oxlint-disable-next-line unicorn/no-thenable
	then(_cb: (component: this) => any): this {
		return this;
	}

	setDisabled(_disabled: boolean): this {
		return this;
	}
}

export class MockButtonComponent extends MockBaseComponent {
	buttonEl: HTMLButtonElement;

	constructor(containerEl: HTMLElement) {
		super();
		this.buttonEl = containerEl.createEl("button");
	}

	setDisabled(disabled: boolean) {
		super.setDisabled(true);
		this.buttonEl.disabled = disabled;
		return this;
	}

	setCta(): this {
		return this;
	}

	removeCta(): this {
		return this;
	}

	setWarning(): this {
		return this;
	}

	setTooltip(_tooltip: string, _options?: TooltipOptions): this {
		return this;
	}

	setButtonText(name: string): this {
		this.buttonEl.textContent = name;
		return this;
	}

	setIcon(_icon: IconName): this {
		return this;
	}

	setClass(cls: string): this {
		this.buttonEl.className = cls;
		return this;
	}

	onClick(callback: (evt: MouseEvent) => unknown): this {
		this.buttonEl.onclick = callback;
		return this;
	}
}

export class MockSetting {
	containerEl: HTMLElement;

	constructor(containerEl: HTMLElement) {
		this.containerEl = containerEl;
	}

	addButton(cb: (component: ButtonComponent) => any): this {
		const component = new MockButtonComponent(this.containerEl);
		cb(component);
		return this;
	}
}

export class MockModal implements CloseableComponent {
	static instances: Set<MockModal> = new Set();

	app: App;

	scope = {} as Scope;

	containerEl: HTMLElement;
	modalEl: HTMLElement;
	titleEl: HTMLElement;
	contentEl: HTMLElement;
	shouldRestoreSelection: boolean = false;

	open: Mock<() => void>;
	close: Mock<() => void>;

	closeCallback: undefined | (() => any);

	constructor(app: App) {
		this.app = app;

		MockModal.instances.add(this);

		this.containerEl = createMockContainer();
		this.modalEl = this.containerEl.createDiv();
		this.titleEl = this.modalEl.createSpan();
		this.contentEl = this.modalEl.createDiv({ cls: "mock-modal-content" });

		this.open = vi.fn(() => {
			document.body.appendChild(this.containerEl);
			void this.onOpen();
		});

		this.close = vi.fn(() => {
			if (document.body.contains(this.containerEl)) {
				document.body.removeChild(this.containerEl);
			}

			this.onClose();
			if (this.closeCallback) this.closeCallback();
			MockModal.instances.delete(this);
		});
	}

	onOpen(): Promise<void> | void {}

	onClose() {}

	setTitle(title: string) {
		this.titleEl.innerText = title;
		return this;
	}

	setContent(content: string | DocumentFragment) {
		this.contentEl.empty();
		if (content instanceof DocumentFragment) {
			this.contentEl.appendChild(content);
		} else {
			this.contentEl.appendText(content);
		}

		return this;
	}

	setCloseCallback(callback: () => any) {
		this.closeCallback = callback;
		return this;
	}

	static cleanupAll() {
		for (const instance of MockModal.instances) {
			instance.close();
		}
		MockModal.instances.clear();
	}
}

export const MockNotice = vi.fn(
	class {
		message: string | DocumentFragment;
		duration?: number;

		constructor(message: string | DocumentFragment, duration?: number) {
			this.message = message;
			this.duration = duration;
		}
	}
);

export class MockMarkdownView {
	editor = {
		setCursor: vi.fn(),
		scrollIntoView: vi.fn(),
	};
}

/**
 * Helper to create the {@link Node.createEl} function added by obsidian
 *
 * @param el Container to create elements within
 * @returns The createDiv function for that container
 */
function createMockCreateEl(el?: Node) {
	return <K extends keyof HTMLElementTagNameMap>(
		tag: K,
		o?: DomElementInfo | string,
		callback?: (el: HTMLElementTagNameMap[K]) => void
	): HTMLElementTagNameMap[K] => {
		const child = document.createElement(tag);

		// Apply options
		if (o) {
			if (typeof o === "string") {
				child.textContent = o;
			} else {
				applyDomElementInfo(child, o);
			}
		}

		// Setup helpers
		setObsidianMockElementHelpers(child);

		// Add to the parent
		if (el) el.appendChild(child);

		// Callback from creation
		if (callback) callback(child);

		return child;
	};
}

/**
 * Sets the createEl/createDiv/createSpan helper functions
 * on the provided node
 *
 * @param node The node to add the helper functions to
 */
export function setObsidianMockElementHelpers(node: Node) {
	node.createEl = vi.fn().mockImplementation(createMockCreateEl(node));
	node.createDiv = vi
		.fn()
		.mockImplementation(
			(o?: DomElementInfo | string, callback?: (el: HTMLDivElement) => void) =>
				node.createEl("div", o, callback)
		);
	node.createSpan = vi
		.fn()
		.mockImplementation(
			(o?: DomElementInfo | string, callback?: (el: HTMLDivElement) => void) =>
				node.createEl("span", o, callback)
		);

	node.empty = vi.fn().mockImplementation(() => {
		node.childNodes.forEach((child) => node.removeChild(child));
	});

	node.appendText = vi.fn((value: string) => {
		node.appendChild(new Text(value));
	});

	(node as Element).setText = vi.fn((value: string) => {
		node.textContent = value;
	});

	(node as ChildNode).remove = vi.fn().mockImplementation(() => {
		const parent = node.parentNode;
		if (parent) {
			parent.removeChild(node);
		}
	});
}

/**
 * Sets the createEl/createDiv/createSpan helper functions on
 * global
 *
 * @param node The node to add the helper functions to
 */
export function setObsidianMockElementHelpersGlobal() {
	globalThis.createEl = vi.fn().mockImplementation(createMockCreateEl());
	globalThis.createDiv = vi
		.fn()
		.mockImplementation(
			(o?: DomElementInfo | string, callback?: (el: HTMLDivElement) => void) =>
				globalThis.createEl("div", o, callback)
		);
	globalThis.createSpan = vi
		.fn()
		.mockImplementation(
			(o?: DomElementInfo | string, callback?: (el: HTMLDivElement) => void) =>
				globalThis.createEl("span", o, callback)
		);
}

/**
 * Applies the attributes from the DomElementInfo onto
 * the provided HTML element
 *
 * @param el The element to apply to
 * @param info The dom element info to apply
 */
function applyDomElementInfo(el: HTMLElement, info: DomElementInfo) {
	if (info.cls) {
		if (Array.isArray(info.cls)) {
			el.classList.add(...info.cls);
		} else {
			el.classList.add(info.cls);
		}
	}

	if (info.text) {
		if (info.text instanceof DocumentFragment) {
			el.appendChild(info.text);
		} else {
			el.textContent = info.text;
		}
	}

	if (info.attr) {
		for (const [key, value] of Object.entries(info.attr)) {
			if (value === null || value === false) {
				el.removeAttribute(key);
			} else {
				el.setAttribute(key, String(value));
			}
		}
	}

	if (info.title) {
		el.title = info.title;
	}

	if (info.parent) {
		if (info.prepend && info.parent.firstChild) {
			info.parent.insertBefore(el, info.parent.firstChild);
		} else {
			info.parent.appendChild(el);
		}
	}

	if (el instanceof HTMLInputElement) {
		if (info.value !== undefined) {
			el.value = info.value;
		}
		if (info.placeholder !== undefined) {
			el.placeholder = info.placeholder;
		}
	}

	if (info.href && el instanceof HTMLAnchorElement) {
		el.href = info.href;
	}
}

/**
 * Helper for creating a mock container element extended with
 */
export function createMockContainer() {
	const container = document.createElement("div");
	setObsidianMockElementHelpers(container);
	return container;
}
