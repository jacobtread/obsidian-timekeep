import React, { useContext } from "react";

import { TimekeepSettings } from "../settings";

export const SettingsContext = React.createContext<TimekeepSettings>(null!);

export function useSettings(): TimekeepSettings {
	return useContext(SettingsContext);
}
