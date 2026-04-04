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
		setIcon: vi.fn((containerEl: HTMLElement, icon: string) => {
			containerEl.innerHTML += `<svg data-icon="${icon}"></svg>`;
		}),
	};
});
