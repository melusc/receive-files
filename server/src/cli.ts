import {opendir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {cwd, exit} from 'node:process';

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

const path = resolve(input[0] ?? cwd());

try {
	await opendir(path);
} catch {
	console.error('"%s" is not a directory', path);
	exit(1);
}

const port = await getPort({
	port: new Set([flags.port, 4444]),
});

if (port !== flags.port) {
	console.log('Using port %s because %s is in use', port, flags.port);
	console.log();
}

// eslint-disable-next-line no-new
new Server(port, path, flags.confirm);
