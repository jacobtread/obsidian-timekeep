import { beforeEach, vi } from "vitest";

vi.mock(import("@/timekeep/id"), () => {
	const mockStore = () => {
		let nextId: number = 1;

		function next() {
			const value = nextId;
			nextId++;
			return value;
		}

		function reset() {
			nextId = 1;
		}

		return {
			next: vi.fn().mockImplementation(next),
			reset,
		};
	};

	let timekeepId = mockStore();
	let timekeepMergerEntries = mockStore();

	// Reset IDs for every test
	beforeEach(() => {
		timekeepId.reset();
		timekeepMergerEntries.reset();
	});

	return {
		timekeepId,
		timekeepMergerEntries,
	};
});
