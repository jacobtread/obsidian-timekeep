import { describe, it, expect, vi } from "vitest";

import { createIdStore, timekeepId, timekeepMergerEntries } from "@/timekeep/id";

vi.unmock("@/timekeep/id");

describe("createIdStore", () => {
	it("should return 1 on first call and increment on subsequent calls", () => {
		const store = createIdStore();

		expect(store.next()).toBe(1);
		expect(store.next()).toBe(2);
		expect(store.next()).toBe(3);
	});

	it("different stores should have independent counters", () => {
		const storeA = createIdStore();
		const storeB = createIdStore();

		expect(storeA.next()).toBe(1);
		expect(storeA.next()).toBe(2);

		expect(storeB.next()).toBe(1);
		expect(storeB.next()).toBe(2);

		expect(storeA.next()).toBe(3);
	});
});

describe("timekeepId store", () => {
	it("should generate incrementing IDs independently", () => {
		const id1 = timekeepId.next();
		const id2 = timekeepId.next();
		const id3 = timekeepId.next();

		expect(id2).toBe(id1 + 1);
		expect(id3).toBe(id2 + 1);
	});
});

describe("timekeepMergerEntries store", () => {
	it("should generate incrementing IDs independently from timekeepId", () => {
		const idStoreValue = timekeepId.next(); // advance timekeepId
		const mergerId1 = timekeepMergerEntries.next();
		const mergerId2 = timekeepMergerEntries.next();

		expect(mergerId1).toBe(1);
		expect(mergerId2).toBe(2);
		expect(timekeepId.next()).toBe(idStoreValue + 1);
	});
});
