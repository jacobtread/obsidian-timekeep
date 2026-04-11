import { afterEach, vi } from "vitest";

import {
	MockButtonComponent,
	MockComponent,
	MockMarkdownView,
	MockModal,
	MockNotice,
	MockPlatform,
	MockSetting,
	MockTAbstractFile,
	MockTFile,
	MockTFolder,
	MockVault,
	setObsidianMockElementHelpersGlobal,
} from "@/__mocks__/obsidian";

vi.mock("obsidian", () => {
	setObsidianMockElementHelpersGlobal();

	// Ensure all mock modals are detached from the DOM after each test
	afterEach(() => {
		MockModal.cleanupAll();
	});

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
		MarkdownView: MockMarkdownView,
		Platform: MockPlatform,
	};
});
