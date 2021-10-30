import logger from 'koa-logger';

export default function loggerInit(app) {
  app.use(logger());
}