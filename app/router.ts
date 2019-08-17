import {Application} from 'egg';
import * as wechat from 'co-wechat';

export default (app: Application) => {
  const {controller, router} = app;

  const config = {
    token: process.env.WX_TOKEN,
    appid: process.env.WX_APPID,
    encodingAESKey: process.env.ENCODING_AES_KEY,
  };
  router.use(wechat(config).middleware(async message => {
    return message;
  }));
  router.get('/', controller.home.index);
};
