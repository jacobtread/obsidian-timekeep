import { beforeEach, vi } from "vitest";

vi.mock(import("@/timekeep/id"), () => {
	const mockStore = () => {
		let nextId: number = 1;

		function next() {
			const value = nextId;
			nextId++;
			return value;
		}

		return {
			next: vi.fn().mockImplementation(next),
		};
	};

	let timekeepId = mockStore();
	let timekeepMergerEntries = mockStore();

	// Reset IDs for every test
	beforeEach(() => {
		timekeepId = mockStore();
		timekeepMergerEntries = mockStore();
	});

	return {
		timekeepId,
		timekeepMergerEntries,
	};
});
