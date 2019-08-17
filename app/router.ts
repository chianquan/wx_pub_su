import {Application} from 'egg';
import * as wechat from 'co-wechat';

export default (app: Application) => {
  app.use(
    wechat({
      token: process.env.WX_TOKEN,
      appid: process.env.WX_APPID,
      encodingAESKey: process.env.ENCODING_AES_KEY,
    }).middleware(async (message, ctx) => {
      ctx.logger.info(message);
      return message;
    }),
  );
};
