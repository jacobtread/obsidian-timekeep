import type { App, TFolder } from "obsidian";

/**
 * Create a new timekeep file within the provided folder
 *
 * @param app App to use for the vault and workspace
 * @param folder
 */
export async function createNewTimekeepFile(app: App, folder: TFolder) {
	const folderPath = folder.path;

	const isNameTaken = (name: string) =>
		folder.children.find((child) => child.name === name) !== undefined;

	let name = "Untitled.timekeep";
	let index = 1;

	while (isNameTaken(name)) {
		name = `Untitled ${index}.timekeep`;
		index += 1;
	}

	const filePath = `${folderPath}${name}`;
	const file = await app.vault.create(filePath, "");

	// Open the created file
	const leaf = app.workspace.getLeaf();
	await leaf.openFile(file);
}
