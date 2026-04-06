import { vi } from "vitest";

import {
	MockButtonComponent,
	MockComponent,
	MockModal,
	MockNotice,
	MockSetting,
	MockTAbstractFile,
	MockTFile,
	MockTFolder,
	MockVault,
	setObsidianMockElementHelpersGlobal,
} from "@/__mocks__/obsidian";

vi.mock("obsidian", () => {
	setObsidianMockElementHelpersGlobal();

	return {
		TFile: MockTFile,
		TFolder: MockTFolder,
		TAbstractFile: MockTAbstractFile,
		Vault: MockVault,
		Component: MockComponent,
		Notice: MockNotice,
		Modal: MockModal,
		setIcon: vi.fn((containerEl: HTMLElement, icon: string) => {
			containerEl.innerHTML += `<svg data-icon="${icon}"></svg>`;
		}),
		Setting: MockSetting,
		ButtonComponent: MockButtonComponent,
	};
});
