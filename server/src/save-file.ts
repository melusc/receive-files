import {copyFile, stat, unlink} from 'node:fs/promises';
import path from 'node:path';

import confirm from '@inquirer/confirm';
import type {File} from 'formidable';

let isRunning = false;
const queue: Array<{
	outDir: string;
	file: File;
	filename: string;
	shouldConfirmSave: boolean;
}> = [];

async function handle() {
	if (isRunning) {
		return;
	}

	isRunning = true;

	while (queue.length > 0) {
		const {outDir, file, shouldConfirmSave, filename} = queue.shift()!;
		const outPath = path.resolve(outDir, path.basename(filename));

		let save = true;
		if (shouldConfirmSave) {
			let message: string;

			try {
				await stat(outPath);
				message = `Save and overwrite "${filename}"?`;
			} catch {
				message = `Save "${filename}"?`;
			}

			save = await confirm({message});
		}

		if (save) {
			await copyFile(file.filepath, outPath);
			console.log('Saved to "%s"', outPath);
		}

		await unlink(file.filepath);
	}

	isRunning = false;
}

export function saveFile(
	outDirectory: string,
	file: File | File[],
	shouldConfirmSave: boolean,
): void {
	if (Array.isArray(file)) {
		for (const file_ of file) {
			saveFile(outDirectory, file_, shouldConfirmSave);
		}

		return;
	}

	let filename = file.originalFilename;

	if (!filename) {
		throw new Error('No filename provided');
	}

	filename = path.basename(filename);

	queue.push({
		outDir: outDirectory,
		file,
		shouldConfirmSave,
		filename,
	});

	void handle();
}
