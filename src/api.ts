import type { Moment } from "moment";
import type { App, TFile, TFolder, Vault, Workspace } from "obsidian";

import { CustomOutputFormat } from "@/output";
import { TimekeepSettings } from "@/settings";
import { createStore, Store } from "@/store";
import * as codeblock from "@/utils/codeblock";
import * as name from "@/utils/name";
import * as time from "@/utils/time";

import * as create from "@/timekeep/create";
import { createNewTimekeepFile } from "@/timekeep/createNewTimekeepFile";
import * as parser from "@/timekeep/parser";
import * as queries from "@/timekeep/queries";
import * as schema from "@/timekeep/schema";
import * as sort from "@/timekeep/sort";
import * as start from "@/timekeep/start";
import { stopAllTimekeeps } from "@/timekeep/stopAllTimekeeps";
import { stopFileTimekeeps } from "@/timekeep/stopFileTimekeeps";
import * as update from "@/timekeep/update";

import { TimekeepAutocomplete } from "@/service/autocomplete";
import {
	TimekeepRegistry,
	TimekeepRegistryEntry,
	TimekeepRegistryItemRef,
	TimekeepRunningEntry,
} from "@/service/registry";

export class TimekeepApi {
	/** Core timekeep modules */
	create: typeof create;
	parser: typeof parser;
	queries: typeof queries;
	schema: typeof schema;
	sort: typeof sort;
	start: typeof start;
	update: typeof update;

	/** Utility modules */
	utils: {
		time: typeof time;
		name: typeof name;
		codeblock: typeof codeblock;
	};

	stopAllTimekeeps: (vault: Vault, currentTime: Moment) => Promise<number>;
	stopFileTimekeeps: (vault: Vault, file: TFile, currentTime: Moment) => Promise<number>;
	createNewTimekeepFile: (app: App, folder: TFolder) => Promise<TFile>;

	registry: TimekeepRegistry;
	autocomplete: TimekeepAutocomplete;

	settings: Store<TimekeepSettings>;
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;

	/** Store creation */
	createStore: <T>(initial: T) => Store<T>;

	/** Registry static APIs */
	getTimekeepsWithinVault: (
		vault: Vault,
		cached?: boolean,
		concurrencyLimit?: number
	) => Promise<TimekeepRegistryEntry[]>;
	getFileRegistryEntry: (
		vault: Vault,
		file: TFile,
		cached?: boolean
	) => Promise<TimekeepRegistryEntry | null>;
	openItemRef: (workspace: Workspace, ref: TimekeepRegistryItemRef) => Promise<void>;
	getRunningEntries: (entries: TimekeepRegistryEntry[]) => TimekeepRunningEntry[];

	constructor(
		settings: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>,
		registry: TimekeepRegistry,
		autocomplete: TimekeepAutocomplete
	) {
		this.settings = settings;
		this.customOutputFormats = customOutputFormats;

		this.create = create;
		this.parser = parser;
		this.queries = queries;
		this.schema = schema;
		this.sort = sort;
		this.start = start;
		this.update = update;

		this.utils = {
			time,
			name,
			codeblock,
		};

		this.stopAllTimekeeps = stopAllTimekeeps;
		this.stopFileTimekeeps = stopFileTimekeeps;
		this.createNewTimekeepFile = createNewTimekeepFile;

		this.registry = registry;
		this.autocomplete = autocomplete;

		this.createStore = createStore;

		this.getTimekeepsWithinVault =
			TimekeepRegistry.getTimekeepsWithinVault.bind(TimekeepRegistry);
		this.getFileRegistryEntry = TimekeepRegistry.getFileRegistryEntry.bind(TimekeepRegistry);
		this.openItemRef = TimekeepRegistry.openItemRef.bind(TimekeepRegistry);
		this.getRunningEntries = TimekeepRegistry.getRunningEntries.bind(TimekeepRegistry);
	}

	registerCustomOutputFormat(id: string, format: CustomOutputFormat) {
		this.customOutputFormats.setState((state) => {
			return {
				...state,
				[id]: format,
			};
		});
	}

	unregisterCustomOutputFormat(id: string) {
		this.customOutputFormats.setState((state) => {
			const newState = { ...state };
			delete newState[id];
			return newState;
		});
	}
}
