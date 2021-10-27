import Koa from 'koa';
import Router from 'koa-router';
import { join } from 'path';
import { createReadStream } from 'fs';
import favicon from 'koa-favicon';
import logger from 'koa-logger';
import { userAgent } from 'koa-useragent';
 
const app = new Koa;
const router = new Router();

app.use(userAgent);
app.use(logger());

router.get('/', (ctx, next) => {
  ctx.response.status = 200
  ctx.response.set('Content-Type', 'text/html')
  const publicRoot = join(process.cwd(), 'public');
  const filePath = join(publicRoot, 'index.html');
  ctx.body = createReadStream(filePath)

  console.log(ctx.userAgent._agent.browser);
  console.log(ctx.userAgent._agent.version);
  console.log(ctx.userAgent._agent.os);
  next();
});

router.get('/css/style.min.css', (ctx, next) => {
  ctx.response.status = 200
  ctx.response.set('Content-Type', 'text/css')
  const publicRoot = join(process.cwd(), 'public', 'css');
  const filePath = join(publicRoot, 'style.min.css');
  ctx.body = createReadStream(filePath)
  next();
});

router.get('/js/main.min.js', (ctx, next) => {
  ctx.response.status = 200
  ctx.response.set('Content-Type', 'text/javascript ')
  const publicRoot = join(process.cwd(), 'public', 'js');
  const filePath = join(publicRoot, 'main.min.js');
  ctx.body = createReadStream(filePath)
  next();
});

router.get('/images/:foo.svg', (ctx, next) => {
  const fileUrl = '/' + ctx.req.url.replace(/.*[\\\/]/, '');
  ctx.response.status = 200
  ctx.response.set('Content-Type', 'image/svg+xml')
  const publicRoot = join(process.cwd(), 'public', 'images');
  const filePath = join(publicRoot, fileUrl);
  ctx.body = createReadStream(filePath)
  next();
});

router.get('/images/:foo.jpg', (ctx, next) => {
  const fileUrl = '/' + ctx.req.url.replace(/.*[\\\/]/, '');
  ctx.response.status = 200
  ctx.response.set('Content-Type', 'image/jpg')
  const publicRoot = join(process.cwd(), 'public', 'images');
  const filePath = join(publicRoot, fileUrl);
  ctx.body = createReadStream(filePath)
  next();
});

router.get('/fonts/:foo', (ctx, next) => {
  const fileUrl = '/' + ctx.req.url.replace(/.*[\\\/]/, '');
  ctx.response.status = 200

  if (fileUrl.indexOf('.woff', 0)) {
    ctx.response.set('Content-Type', 'font/woff')
  }

  if (fileUrl.indexOf('.woff2', 0)) {
    ctx.response.set('Content-Type', 'font/woff2')
  }
  const publicRoot = join(process.cwd(), 'public', 'fonts');
  const filePath = join(publicRoot, fileUrl);
  ctx.body = createReadStream(filePath)
  next();
});

app.use(router.routes())

app.listen(3000);