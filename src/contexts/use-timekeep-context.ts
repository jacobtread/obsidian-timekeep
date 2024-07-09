import { Timekeep } from "@/schema";
import React, { Dispatch, useContext, SetStateAction } from "react";

type TimekeepContext = {
	timekeep: Timekeep;
	setTimekeep: Dispatch<SetStateAction<Timekeep>>;
	isTimekeepRunning: boolean;

	// Show a confirmation dialog, provides a promise that resolves
	// to the users choice
	showConfirm: (title: string, message: string) => Promise<boolean>;
};

export const TimekeepContext = React.createContext<TimekeepContext>(null!);

export function useTimekeep(): TimekeepContext {
	return useContext(TimekeepContext);
}
