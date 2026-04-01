import type { EventRef, TAbstractFile, TFile, Vault } from "obsidian";

import { vi } from "vitest";

function createTFile(vault: Vault, path: string): TFile {
	const nameIndex = path.lastIndexOf("/");
	const name = path.substring(nameIndex);

	const endIndex = name.lastIndexOf(".");

	const basename = name.substring(0, endIndex);
	const extension = name.substring(endIndex);

	const file: TFile = {
		stat: { ctime: 0, mtime: 0, size: 0 },
		vault,
		path,
		name,
		parent: null,
		basename,
		extension,
	};

	return file;
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

type MockEventRef = { index: number } & EventRef;

export class MockVault {
	_files: Record<string, string> = {};
	_cache: Record<string, string> = {};
	_events: MockVaultEventRecord = {
		create: [],
		delete: [],
		modify: [],
		rename: [],
	};

	constructor(initialFiles: Record<string, string> = {}) {
		this._files = initialFiles;
	}

	getMarkdownFiles = vi.fn(() => {
		return Object.keys(this._files).map((path) => createTFile(this.asVault(), path));
	});

	process = vi.fn(async (file: TFile, func: (data: string) => string) => {
		const content = await this.read(file);
		const data = func(content);
		await this.write(file, data);
		return data;
	});

	read = vi.fn(async (file: TFile) => {
		this._cache[file.path] = this._files[file.path];
		return this._files[file.path] ?? "";
	});

	write = vi.fn(async (file: TFile, data: string) => {
		const isCreation = this._files[file.path] === undefined;

		this._files[file.path] = data;
		this._cache[file.path] = data;

		if (isCreation) {
			this.emitEvent("create", file);
		} else {
			this.emitEvent("modify", file);
		}
	});

	cachedRead = vi.fn(async (file: TFile) => {
		if (this._cache[file.path]) {
			return this._cache[file.path];
		}

		return await this.read(file);
	});

	addFile(path: string, value: string): TFile {
		this._files[path] = value;

		const file = createTFile(this.asVault(), path);
		this.emitEvent("create", file);

		return file;
	}

	removeFile(path: string) {
		if (this._files[path]) {
			const file = createTFile(this.asVault(), path);
			this.emitEvent("delete", file);
			delete this._files[path];
		}
	}

	renamefile(path: string, newPath: string) {
		if (this._files[path]) {
			const fileData = this._files[path];
			this._files[newPath] = fileData;
			delete this._files[path];

			const file = createTFile(this.asVault(), newPath);

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

	on<K extends keyof MockVaultEvents>(
		name: K,
		callback: MockVaultEvents[K],
		_ctx?: any
	): EventRef {
		const currentSet = this._events[name] ?? (this._events[name] = []);
		currentSet.push(callback);
		return { index: this._events[name].length - 1 } as MockEventRef;
	}
}
