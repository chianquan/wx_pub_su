import {Application} from 'egg';
import * as wechat from 'co-wechat';

export default (app: Application) => {
  app.use(async (ctx, next) => {
    ctx.logger.info(`method:${ctx.method} path:${ctx.path} ${JSON.stringify(ctx.queries)}`);
    await next();
    ctx.logger.info(ctx.body);
  });
  app.use(wechat({
    token: process.env.WX_TOKEN,
    appid: process.env.WX_APPID,
    encodingAESKey: process.env.ENCODING_AES_KEY,
  }).middleware(async message => {
    return message;
  }));
};
