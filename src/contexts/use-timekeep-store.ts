import { Store } from "@/store";
import { Timekeep } from "@/timekeep/schema";
import { useContext, createContext } from "react";

export type TimekeepStore = Store<Timekeep>;

export const TimekeepStoreContext = createContext<TimekeepStore>(null!);

export function useTimekeepStore(): TimekeepStore {
	return useContext(TimekeepStoreContext);
}
