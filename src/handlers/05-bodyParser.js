import bodyParser from 'koa-bodyparser';

export default function bodyParserInit(app) {
  app.use(bodyParser());
}