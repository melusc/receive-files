/* eslint-disable no-await-in-loop */

import {cp, stat} from 'node:fs/promises';
import {basename, resolve} from 'node:path';

// eslint-disable-next-line import/no-extraneous-dependencies
import {type File} from 'formidable';
import inquirer from 'inquirer';

const confirm = async (message: string) => {
	const result = await inquirer.prompt<{save: boolean}>([
		{
			name: 'save',
			type: 'confirm',
			message,
			default: true,
		},
	]);

	return result.save;
};

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

		const path = resolve(outDir, basename(filename));

		let save = true;
		if (shouldConfirmSave) {
			let message: string;

			try {
				await stat(path);
				message = `Save and overwrite "${filename}"?`;
			} catch {
				message = `Save "${filename}"?`;
			}

			save = await confirm(message);
		}

		if (save) {
			const outPath = resolve(outDir, filename);
			console.log('Saved "%s"', outPath);
			await cp(file.filepath, outPath, {
				force: true,
			});
		}
	}

	isRunning = false;
}

export function saveFile(
	outDir: string,
	file: File | File[],
	shouldConfirmSave: boolean,
): void {
	if (Array.isArray(file)) {
		for (const file_ of file) {
			saveFile(outDir, file_, shouldConfirmSave);
		}

		return;
	}

	let filename = file.originalFilename;

	if (!filename) {
		throw new Error('No filename provided');
	}

	filename = basename(filename);

	queue.push({
		outDir,
		file,
		shouldConfirmSave,
		filename,
	});

	void handle();
}
