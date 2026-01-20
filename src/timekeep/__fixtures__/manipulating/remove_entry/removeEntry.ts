import moment from "moment";
import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const parent: TimeEntry = {
	id: "49b99108-b1ad-4355-baa9-89c49c342be2",
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entryToRemove: TimeEntry = {
	id: "49b99108-b1ad-4355-baa9-89c49c342be2",
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};
