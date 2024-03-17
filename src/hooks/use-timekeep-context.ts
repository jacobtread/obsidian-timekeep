import React, { Dispatch, SetStateAction, useContext, useState } from "react";

import { TimekeepSettings } from "../settings";
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
