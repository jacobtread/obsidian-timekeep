import { useCallback } from "react";
import { ConfirmModal } from "@/utils/confirm-modal";

import { useApp } from "./use-app-context";

type UseDialog = {
	// Show a confirmation dialog, provides a promise that resolves
	// to the users choice
	showConfirm: (title: string, message: string) => Promise<boolean>;
};

export function useDialog(): UseDialog {
	const app = useApp();

	const showConfirm = useCallback(
		(title: string, message: string): Promise<boolean> => {
			return new Promise((resolve) => {
				const modal = new ConfirmModal(app, message, resolve);
				modal.setTitle(title);
				modal.open();
			});
		},
		[app]
	);

	return { showConfirm };
}
