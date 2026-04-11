import { Timekeep } from "@/timekeep/schema";

export interface TimesheetSaveAdapter {
	onLoad(): void;

	onUnload(): void;

	onSave(timekeep: Timekeep): Promise<void>;
}
