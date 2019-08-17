import {Service} from 'egg';
import moment = require('moment');
import _ = require('lodash');
import cdf = require('distributions-normal-cdf');


const cache = {
  dayStr: '',
  lastDayClose: 0,
  theMiddle: 0,
};
/**
 * Test Service
 */
export default class GuessStock extends Service {
  async getTodayUpRate() {
    const {app} = this;
    const todayStr = moment('2019-08-16').format('YYYY-MM-DD'); // todo test
    if (cache.dayStr !== todayStr) {
      const ret = await app.curl('http://api.finance.ifeng.com/akmin?scode=sh000001&type=60', {
        dataType: 'json',
        contentType: 'json',
      });
      const {data, status} = ret;
      if (status !== 200) {
        throw new Error(`error : status ${status}`);
      }
      const record: Array<[string, string, string, string]> = data.record;
      const recordGroupMap = _.groupBy(record, line => line[0].split(' ')[0]);
      const days = _.chain(recordGroupMap).keys().sort().value();
      const thisDay = days.pop();
      if (thisDay !== todayStr) {
        throw new Error('获取不到今日数据哦');
      }
      const middleLine = _.find(recordGroupMap[thisDay], ([time]) => {
        return time === `${thisDay} 11:30:00`;
      });
      if (!middleLine) {
        throw new Error('还未能获取到11:30分的数据哦');
      }
      const theMiddle = parseFloat(middleLine[3]);
      if (!theMiddle) {
        throw new Error('数据有误');
      }
      cache.theMiddle = theMiddle;
      const lastDay = days.pop();
      if (!lastDay) {
        throw new Error('获取不到昨日收盘价哦');
      }
      const lastEndLine = _.find(recordGroupMap[lastDay], ([time]) => {
        return time === `${lastDay} 15:00:00`;
      });
      if (!lastEndLine) {
        throw new Error('获取上个交易日收盘价失败');
      }
      const lastDayClose = parseFloat(lastEndLine[3]);
      if (!lastDayClose) {
        throw new Error('数据有误');
      }
      cache.lastDayClose = lastDayClose;
    }
    const u = 1.392 / 100000;
    const sig = 4.326 / 10000;
    const t = 120;
    const sp = cache.lastDayClose;
    const s0 = cache.theMiddle;
    // const sp = 2597.78;
    // const s0 = 2605.32;
    const tmp = 1.0 / Math.sqrt(t) / sig * (Math.log(sp / s0) - (u - sig ** 2 / 2) * t);
    return 1 - cdf(tmp);
  }

  async getMathExpectation(todayUpGuessRate: number) {
    const todayUpRate = await this.getTodayUpRate();
    return todayUpRate * (1 / todayUpGuessRate);
  }

  async guess(todayUpGuessRate?: number): Promise<string> {
    if (todayUpGuessRate === undefined) {
      const todayUpRate = await this.getTodayUpRate();
      return `今日上涨的概率为${todayUpRate.toFixed(2)}`;
    } else {
      const mathExpection = await this.getMathExpectation(todayUpGuessRate);
      if (mathExpection >= 1) {
        return `上证指数上涨的期望值为${mathExpection.toFixed(2)}（>=1）,应该猜涨涨涨～～`;
      } else {

        return `上证指数上涨的期望值为${mathExpection.toFixed(2)}（<1）,应该猜跌跌跌～～`;
      }
    }
  }
}
