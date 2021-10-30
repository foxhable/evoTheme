import favicon from 'koa-favicon';

export default function faviconInit(app) {
  app.use(favicon('public/images/favicon.ico', import.meta.url));
}