import {stat} from 'node:fs/promises';
import path from 'node:path';
import process, {cwd} from 'node:process';

import getPort from 'get-port';
import meow from 'meow';

import {Server} from './server.ts';

const {flags, input} = meow(
	`

	Usage
	  $ file-receiver [path]
	  [path] The path to write the files to, defaults to current dir

	Options
		--port, -p     The port to run the server on, default 4444
		--confirm, -c  Wait for confirmation before saving file

`,
	{
		allowUnknownFlags: false,
		importMeta: import.meta,
		flags: {
			port: {
				shortFlag: 'p',
				type: 'number',
				default: 4444,
			},
			confirm: {
				shortFlag: 'c',
				type: 'boolean',
				default: true,
			},
		},
	},
);

const outDirectory = path.resolve(input[0] ?? cwd());

async function checkIsDirectory(path: string): Promise<boolean> {
	try {
		const stats = await stat(path);
		return stats.isDirectory();
	} catch (error: unknown) {
		const nodeError = error as NodeJS.ErrnoException;

		if (nodeError.code === 'ENOENT') {
			return false;
		}

		throw error;
	}
}

const isDirectory = await checkIsDirectory(outDirectory);
if (isDirectory) {
	const port = await getPort({
		port: new Set([flags.port, 4444]),
	});

	if (port !== flags.port) {
		console.log('Using port %s because %s is in use', port, flags.port);
		console.log();
	}

	new Server(port, outDirectory, flags.confirm);
} else {
	console.error('"%s" is not a directory or does not exist.', outDirectory);
	process.exitCode = 1;
}
