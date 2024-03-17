import React, { Dispatch, SetStateAction, useContext } from "react";
import { Timekeep } from "src/timekeep";

type TimekeepContext = {
	timekeep: Timekeep;
	setTimekeep: Dispatch<SetStateAction<Timekeep>>;
	isTimekeepRunning: boolean;
};

export const TimekeepContext = React.createContext<TimekeepContext>(null!);

export function useTimekeep(): TimekeepContext {
	return useContext(TimekeepContext);
}
