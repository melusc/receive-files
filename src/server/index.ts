import Koa from 'koa';
import Router from '@koa/router';

export class Server {
	app: Koa;

	constructor(public readonly port: number, public readonly path: string) {
		const app = new Koa();
		this.app = app;

		const router = new Router({
			sensitive: false,
		});

		router.get('/', this.index);

		app.use(router.routes());
		app.listen(port, () => {
			console.log('Running at http://localhost:%s/', port);
		});
	}

	upload: Router.Middleware = ctx => {
		ctx.body = 'A';
	};

	index: Router.Middleware = ctx => {
		ctx.body = 'Index';
	};
}
