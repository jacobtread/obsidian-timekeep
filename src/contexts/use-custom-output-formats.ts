import React, { useContext } from "react";
import { CustomOutputFormat } from "@/output";

export const CustomOutputFormatsContext = React.createContext<
	Record<string, CustomOutputFormat>
>({});

export function useCustomOutputFormats(): Record<string, CustomOutputFormat> {
	return useContext(CustomOutputFormatsContext);
}
