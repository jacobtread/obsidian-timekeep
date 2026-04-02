import { vi } from "vitest";

import {
	MockComponent,
	MockNotice,
	MockTAbstractFile,
	MockTFile,
	MockTFolder,
	MockVault,
} from "@/__mocks__/obsidian";

vi.mock("obsidian", () => {
	return {
		TFile: MockTFile,
		TFolder: MockTFolder,
		TAbstractFile: MockTAbstractFile,
		Vault: MockVault,
		Component: MockComponent,
		Notice: MockNotice,
	};
});
