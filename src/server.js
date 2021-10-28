import Koa from 'koa';
import Router from 'koa-router';
import { join } from 'path';
import { createReadStream, writeFile } from 'fs';
import { readFile } from 'fs/promises';
import logger from 'koa-logger';
import { userAgent } from 'koa-useragent';
import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'koa-bodyparser';

const app = new Koa;
const router = new Router();

app.use(userAgent);
app.use(logger());
app.use(bodyParser());

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

router.get('/get-cookie', async function (ctx, next) {
  ctx.response.status = 200
  const newUuid = uuidv4();
  ctx.cookies.set('uuid', newUuid, { maxAge: 9e14, httpOnly: false });

  const dataArr = JSON.parse(await readFile(new URL('./data/data.json', import.meta.url)));

  dataArr[newUuid] = {"nCompleted": [], "completed": []};

  const json = JSON.stringify(dataArr, null, 2);
  writeFile('./data/data.json', json, (err) => {
    if (err) throw err;
  });

  next();
});

router.get('/get-data', async function (ctx, next) {
  ctx.response.status = 200;
  ctx.response.set('Content-Type', 'application/json');
  const uuid = ctx.cookies.get('uuid');

  const dataArr = JSON.parse(await readFile(new URL('./data/data.json', import.meta.url)));

  if (uuid in dataArr) {
    const lists = dataArr[uuid];
    const json = JSON.stringify(lists);
    ctx.body = json;
  }
  next();
});

router.post('/post-data', async function (ctx, next) {
  ctx.response.status = 200;
  const uuid = ctx.cookies.get('uuid');
  const data = ctx.request.body;
  const dataArr = JSON.parse(await readFile(new URL('./data/data.json', import.meta.url)));

  if (uuid in dataArr) {
    dataArr[uuid] = data;
    const json = JSON.stringify(dataArr, null, 2);
    writeFile('./data/data.json', json, (err) => {
      if (err) throw err;
    });
  }

  next();
});

app.use(router.routes())

app.listen(3000);