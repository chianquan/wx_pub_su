import {Application} from 'egg';
import * as wechat from 'co-wechat';

export default (app: Application) => {
  const {controller, config, router} = app;
  app.logger.info(config);
  router.use(ctx => {
    ctx.logger.info(`method:${ctx.method} path:${ctx.path} ${ctx.queries}`);
  });
  router.use(wechat({
    token: process.env.WX_TOKEN,
    appid: process.env.WX_APPID,
    encodingAESKey: process.env.ENCODING_AES_KEY,
  }).middleware(async message => {
    return message;
  }));
  router.get('/', controller.home.index);
};
