const moment = require('moment');
const repo = require('./repository');

/**
 *
 */
exports.openTrade = async (protoNo, abbrev, rate, notes, stats, timeInterval) => {
  const trade = {
    proto_no: protoNo,
    abbrev,
    open_rate: rate,
    open_notes: notes,
    open_stats: stats,
    time_interval: timeInterval
  };

  try {
    await repo.createTrade(trade)
  } catch (err) {
    throw new Error(`could not create trade >> ${err}`)
  }
}

/**
 *
 */
exports.closeTrade = async (protoNo, abbrev, rate, notes, timeInterval) => {
 let openTrade;
 try {
    openTrade = await repo.getLastTrade(protoNo, abbrev, timeInterval);
  } catch (err) {
    throw new Error(`Getting last trade: ${err}`)
  }
  if (openTrade && openTrade.closed) {
    throw new Error(`Last trade for proto:${protoNo} abbrev:${abbrev} is closed`);
  }

  const now = new Date();
  const trade = {
    close_rate: rate,
    close_date: moment(now.toISOString()).format('YYYY-MM-DD HH:mm:ss'),
    close_notes: notes,
    closed: true,
  }

  try {
    await repo.updateTrade(openTrade.id, trade);
  } catch(err) {
    throw new Error(`updating trade for ${openTrade.id}: ${err}`)
  }
}
