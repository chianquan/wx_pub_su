import {Application} from 'egg';
import * as wechat from 'co-wechat';

export default (app: Application) => {
  // app.use(async (ctx: Context) => {
  //   ctx.body = await ctx.service.guessStock.guess(0.98);
  // });
  app.use(
    wechat({
      token: process.env.WX_TOKEN,
      appid: process.env.WX_APPID,
      encodingAESKey: process.env.ENCODING_AES_KEY,
    }).middleware(async (message, ctx) => {
      if (message.MsgType === 'text') {
        const content: string = message.Content;
        if (content.includes('涨跌')) {

          const tmp = /[\d.]+/.exec(content);
          const percentStr = tmp && tmp[0] && parseFloat(tmp[0]);
          try {
            if (!percentStr) {
              return await ctx.service.guessStock.guess();
            }
            return await ctx.service.guessStock.guess(percentStr / 100);
          } catch (e) {
            return e.message;
          }
        }
      }
      return '你很帅哦～～～';
    }),
  );
};
