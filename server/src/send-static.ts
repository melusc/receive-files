import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import calculate from 'etag';
import isPathInside from 'is-path-inside';
import {type ParameterizedContext} from 'koa';

const notFound = new Set(['ENOENT', 'ENAMETOOLONG', 'ENOTDIR']);

export async function sendStatic(
	context: ParameterizedContext,
	filename: string,
	distributionDirectory: URL,
) {
	const requestedPath = new URL(
		filename.replace(/^\//, ''),
		distributionDirectory,
	);
	if (
		!isPathInside(
			fileURLToPath(requestedPath),
			fileURLToPath(distributionDirectory),
		)
	) {
		context.throw(400);
		return;
	}

	try {
		const stats = await stat(requestedPath);

		if (!stats.isFile()) {
			return stats;
		}

		context.response.status = 200;
		context.response.lastModified = stats.mtime;
		context.response.length = stats.size;
		context.response.type = path.extname(filename);

		context.response.etag = calculate(stats, {
			weak: true,
		});

		// Fresh based solely on last-modified
		switch (context.request.method) {
			case 'HEAD': {
				context.status = context.request.fresh ? 304 : 200;
				break;
			}

			case 'GET': {
				if (context.request.fresh) {
					context.status = 304;
				} else {
					context.body = createReadStream(requestedPath);
				}

				break;
			}

			// No default
		}

		return stats;
	} catch (error) {
		if (
			'code' in (error as Error) &&
			notFound.has((error as {code: string}).code)
		) {
			return;
		}

		context.throw(500);
	}
}
