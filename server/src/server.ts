/*!
 * This file is part of receive-files, software to easily receive files
 * over the network.
 * Copyright (C) 2026, Luca Schnellmann <oss@lusc.ch>

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {fileURLToPath} from 'node:url';

import express from 'express';
import multer, {memoryStorage} from 'multer';

import {parseArguments as parseArguments} from './arguments.ts';
import {saveFile} from './save-file.ts';
import {getNetworkAddress} from './utilities.ts';

const config = await parseArguments();

const staticDistributionDirectory = fileURLToPath(
	import.meta.resolve('client'),
);
const multerUpload = multer({
	storage: memoryStorage(),
	limits: {
		// ~1 GB
		fileSize: 1024 ** 3,
	},
});

const app = express();
app.get('/', (_request, response, next) => {
	response.sendFile(
		'index.html',
		{
			root: staticDistributionDirectory,
		},
		error => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (error) {
				next();
			}
		},
	);
});
app.get('/index.html', (_request, response) => {
	response.redirect('/');
});

app.post('/upload', multerUpload.array('file'), (request, response) => {
	if (request.files && Array.isArray(request.files)) {
		saveFile(config.outDirectory, request.files, config.confirm);
	}

	response.redirect('/');
});

app.get(/.+/, (request, response, next) => {
	response.sendFile(
		request.path,
		{
			root: staticDistributionDirectory,
		},
		error => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (error) {
				next();
			}
		},
	);
});

app.use((_request, response) => {
	response.status(404).send('404 - Not found');
});

app.listen(config.port, () => {
	console.log('Running');

	console.log('- Local:	http://localhost:%s/', config.port);

	const localIpAddress = getNetworkAddress();
	if (localIpAddress) {
		console.log('- Network:	http://%s:%s/', localIpAddress, config.port);
	}

	console.log();
});
