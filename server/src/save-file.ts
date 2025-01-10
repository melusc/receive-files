import {stat, writeFile} from 'node:fs/promises';
import path from 'node:path';

import confirm from '@inquirer/confirm';

let isRunning = false;
const queue: Array<{
	outDir: string;
	file: Express.Multer.File;
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
			await writeFile(outPath, file.buffer);
			console.log('Saved to "%s"', outPath);
		}
	}

	isRunning = false;
}

export function saveFile(
	outDirectory: string,
	files: Express.Multer.File[],
	shouldConfirmSave: boolean,
): void {
	for (const file of files) {
		let filename = file.originalname;

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
	}

	void handle();
}
