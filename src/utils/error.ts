export function getErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	} else if (typeof error === "string") {
		return error;
	} else {
		return "Unknown error occurred";
	}
}
