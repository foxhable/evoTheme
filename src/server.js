import Koa from 'koa';
const app = new Koa;

import('./handlers/01-favicon.js')   .then(obj => {obj.default(app)});
import('./handlers/02-static.js')    .then(obj => {obj.default(app)});
import('./handlers/03-logger.js')    .then(obj => {obj.default(app)});
import('./handlers/04-errors.js')    .then(obj => {obj.default(app)});

import bodyParser from 'koa-bodyparser';   app.use(bodyParser());
import { userAgent } from 'koa-useragent'; app.use(userAgent);

import Router from 'koa-router';
const router = new Router();

import { writeFile } from 'fs';
import { readFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';


router.get('/get-themes', async function (ctx, next) {
  const allData = JSON.parse(await readFile(new URL('./data/data.json', import.meta.url)));
  const uuid = ctx.cookies.get('uuid');

  if (!uuid) {
    const newUuid = uuidv4();
    ctx.cookies.set('uuid', newUuid, { maxAge: 9e14, httpOnly: false });
    
    allData[newUuid] = {};
    allData[newUuid]["userInfo"] = {};
    allData[newUuid]["lists"] = { "nCompleted": [], "completed": [] };
    
    allData[newUuid]["userInfo"]["lastEntry"] = Date();
    
    allData[newUuid]["userInfo"]["browser"] = ctx.userAgent.browser + " v" + ctx.userAgent.version;
    allData[newUuid]["userInfo"]["os"]      = ctx.userAgent.os;
    
    allData[newUuid]["userInfo"]["entryCounts"] = 1;
    
    await writeDataInJSON(allData)
    
    ctx.response.status = 200;
    next();
  } else if (uuid in allData) {
    if (!("userInfo" in allData[uuid])) allData[uuid]["userInfo"] = {};

    if (uuid in allData && "userInfo" in allData[uuid]) {
      allData[uuid]["userInfo"]["lastEntry"] = Date();
  
      allData[uuid]["userInfo"]["browser"] = ctx.userAgent.browser + " v" + ctx.userAgent.version;
      allData[uuid]["userInfo"]["os"]      = ctx.userAgent.os;
      
      let n = allData[uuid]["userInfo"]["entryCounts"] || 0;
      allData[uuid]["userInfo"]["entryCounts"] = ++n;

      await writeDataInJSON(allData);
    }

    const lists = allData[uuid];
    const json = JSON.stringify(lists);
    ctx.body = json;
    
    ctx.response.set('Content-Type', 'application/json');
    ctx.response.status = 200;
    await next();
  }
});

router.post('/post-themes', async function (ctx, next) {
  const uuid = ctx.cookies.get('uuid');
  const data = ctx.request.body;
  const allData = JSON.parse(await readFile(new URL('./data/data.json', import.meta.url)));
  
  if (uuid in allData) {
    allData[uuid]["lists"] = data;
    await writeDataInJSON(allData);
  }
  
  ctx.response.status = 200;
  next();
});

async function writeDataInJSON(newData) {
  const json = JSON.stringify(newData, null, 2);

  writeFile('./data/data.json', json, (err) => {
    if (err) throw err;
  });
}

app.use(router.routes())

app.listen(80);