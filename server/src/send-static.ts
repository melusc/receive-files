import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {extname} from 'node:path';
import {fileURLToPath} from 'node:url';

import calculate from 'etag';
import isPathInside from 'is-path-inside';
import {type ParameterizedContext} from 'koa';

const notFound = new Set(['ENOENT', 'ENAMETOOLONG', 'ENOTDIR']);

export async function sendStatic(
	ctx: ParameterizedContext,
	filename: string,
	distDir: URL,
) {
	const path = new URL(filename.replace(/^\//, ''), distDir);
	if (!isPathInside(fileURLToPath(path), fileURLToPath(distDir))) {
		ctx.throw(400);
		return;
	}

	try {
		const stats = await stat(path);

		if (!stats.isFile()) {
			return stats;
		}

		ctx.response.status = 200;
		ctx.response.lastModified = stats.mtime;
		ctx.response.length = stats.size;
		ctx.response.type = extname(filename);

		if (!ctx.response.etag) {
			ctx.response.etag = calculate(stats, {
				weak: true,
			});
		}

		// Fresh based solely on last-modified
		switch (ctx.request.method) {
			case 'HEAD': {
				ctx.status = ctx.request.fresh ? 304 : 200;
				break;
			}

			case 'GET': {
				if (ctx.request.fresh) {
					ctx.status = 304;
				} else {
					ctx.body = createReadStream(path);
				}

				break;
			}

			// No default
		}

		return stats;
	} catch (error) {
		if (
			'code' in (error as Error)
			&& notFound.has((error as {code: string}).code)
		) {
			return;
		}

		ctx.throw(500);
	}
}
