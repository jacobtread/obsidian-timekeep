import type { TFile, Vault } from "obsidian";

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

export class MockVault {
    _files: Record<string, string> = {};
    _cache: Record<string, string> = {};

    constructor(initialFiles: Record<string, string> = {}) {
        this._files = initialFiles;
    }

    getMarkdownFiles = jest.fn(() => {
        return Object.keys(this._files).map((path) =>
            createTFile(this.asVault(), path)
        );
    });

    process = jest.fn(async (file: TFile, func: (data: string) => string) => {
        const content = await this.read(file);
        const data = func(content);
        await this.write(file, data);
        return data;
    });

    read = jest.fn(async (file: TFile) => {
        this._cache[file.path] = this._files[file.path];
        return this._files[file.path] ?? "";
    });

    write = jest.fn(async (file: TFile, data: string) => {
        this._files[file.path] = data;
        this._cache[file.path] = data;
    });

    cachedRead = jest.fn(async (file: TFile) => {
        if (this._cache[file.path]) {
            return this._cache[file.path];
        }

        return await this.read(file);
    });

    addFile(path: string, value: string): TFile {
        this._files[path] = value;
        return createTFile(this.asVault(), path);
    }

    asVault(): Vault {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this as any as Vault;
    }
}
