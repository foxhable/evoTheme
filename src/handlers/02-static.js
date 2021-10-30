import serve from 'koa-static';

export default function staticInit(app) {
  app.use(serve('public'));
}