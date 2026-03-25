import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";
import { TimeEntry, Timekeep } from "@/timekeep/schema";
import { App, Component } from "obsidian";
import { TimesheetRowContainer } from "./timesheetRowContainer";
import { getEntriesSorted } from "@/timekeep";

export class TimesheetTable extends Component {
    /** Parent container element */
    #containerEl: HTMLElement;

    /** Access to the app instance */
    app: App;
    /** Access to the timekeep */
    timekeep: Store<Timekeep>;
    /** Access to the timekeep settings */
    settings: Store<TimekeepSettings>;

    /** Wrapper container */
    #wrapperEl: HTMLDivElement | undefined;
    /** Table body for row content */
    #bodyEl: HTMLElement | undefined;

    /** Currently mounted row children */
    #rows: TimesheetRowContainer[] = [];

    constructor(
        containerEl: HTMLElement,
        app: App,
        timekeep: Store<Timekeep>,
        settings: Store<TimekeepSettings>
    ) {
        super();

        this.#containerEl = containerEl;

        this.app = app;
        this.timekeep = timekeep;
        this.settings = settings;
    }

    onload(): void {
        super.onload();

        const wrapperEl = this.#containerEl.createDiv();
        this.#wrapperEl = wrapperEl;

        const tableEl = wrapperEl.createEl("table", { cls: "timekeep-table" });
        const tableHeadEl = tableEl.createEl("thead", {
            cls: "timekeep-table-head",
        });

        const tableHeadRowEl = tableHeadEl.createEl("tr");
        tableHeadRowEl.createEl("th", { text: "Block" });
        tableHeadRowEl.createEl("th", { text: "Start time" });
        tableHeadRowEl.createEl("th", { text: "End time" });
        tableHeadRowEl.createEl("th", { text: "Duration" });
        tableHeadRowEl.createEl("th", { text: "Actions" });

        const bodyEl = tableEl.createEl("tbody");
        this.#bodyEl = bodyEl;

        const onUpdate = this.onUpdate.bind(this);

        const unsubscribeSettings = this.settings.subscribe(onUpdate);
        const unsubscribeTimekeep = this.timekeep.subscribe(onUpdate);

        this.register(unsubscribeSettings);
        this.register(unsubscribeTimekeep);

        onUpdate();
    }

    onunload(): void {
        super.onunload();
        this.#wrapperEl?.remove();
    }

    onUpdate() {
        this.updateWrapperSize();
        this.renderRows();
    }

    updateWrapperSize() {
        if (!this.#wrapperEl) return;

        const settings = this.settings.getState();

        if (settings.limitTableSize) {
            this.#wrapperEl.style.maxHeight = "600px";
            this.#wrapperEl.style.overflowY = "auto";
        } else {
            this.#wrapperEl.style.removeProperty("maxHeight");
            this.#wrapperEl.style.removeProperty("overflowY");
        }
    }

    clearRows() {
        // Unload existing children and reset the rows list
        for (const row of this.#rows) {
            this.removeChild(row);
        }

        this.#rows = [];
    }

    renderRows() {
        const bodyEl = this.#bodyEl;
        if (!bodyEl) return;

        type StackEntry = { entry: TimeEntry; depth: number };

        const timekeep = this.timekeep.getState();
        const settings = this.settings.getState();

        const stack: StackEntry[] = getEntriesSorted(timekeep.entries, settings)
            //
            .map((entry) => ({
                entry,
                depth: 0,
            }));

        while (stack.length > 0) {
            const { entry, depth } = stack.pop()!;

            const row = new TimesheetRowContainer(
                bodyEl,
                this.app,
                this.timekeep,
                this.settings,
                entry,
                depth
            );

            this.addChild(row);
            this.#rows.push(row);

            if (
                entry.subEntries &&
                !entry.collapsed &&
                entry.subEntries.length > 0
            ) {
                const sortedEntries = getEntriesSorted(
                    entry.subEntries,
                    settings
                );

                for (let i = sortedEntries.length - 1; i >= 0; i--) {
                    stack.push({
                        entry: sortedEntries[i],
                        depth: depth + 1,
                    });
                }
            }
        }
    }
}
