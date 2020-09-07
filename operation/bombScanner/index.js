require("module-alias/register");
const getCandles = require("./service/getCandles");
const getImpulseWaves = require("./service/impulseWaveScan");
const getStageOne = require("./service/stageOneScan");
const getStageTwo = require("./service/stageTwoScan");
const getValidBombs = require("./service/validBombScan");
const getBombStats = require("./service/bombStats");
const validateBombStats = require("./service/validateBombStats");
const uploadBombStats = require("./service/uploadBombStats");
const formatMysqlDate = require("@/services/formatMysqlDate");
const db = require("@/dbStatistics");
const { connect } = require("mongoose");
const { response } = require("express");

const ABBREV = "EURJPY";
const GRAN = "H1";
const SINCEDATE = "2019-10-01T00:00:00.000Z";
const ENDDATE = "2019-11-01T00:00:00.000Z";
const uploadToDB = false;

(async () => {
  const candles = await getCandles(GRAN, ABBREV, SINCEDATE, ENDDATE);

  console.log("first candles");
  console.log(candles[0]);

  console.log("last candle -->");
  console.log(candles[candles.length - 1]);

  return;

  const impulseWaves = getImpulseWaves(candles, ABBREV);
  const stageOne = getStageOne(impulseWaves, candles, ABBREV);
  const stageTwo = getStageTwo(stageOne, candles);
  stageTwo.forEach((x) => {
    console.log(x.impulseWave.date.start);
  });

  const bombs = getValidBombs(stageTwo, candles);

  console.log();
  console.log("------------------------------");

  bombs.forEach((x) => {
    console.log(x.impulseWave.trend);
    console.log(x.date.end);
    console.log();
  });

  console.log(`bombs .. ${bombs.length}`);

  return;

  const stats = [];
  bombs.forEach((bomb, i) => {
    // if (i > 0) return
    const bombStats = getBombStats(bomb, ABBREV);
    validateBombStats(bombStats);
    stats.push(bombStats);
  });

  return;

  // const conn = db()
  // for (let i=0; i <= stats.length; i++) {
  //   const stat=stats[i]

  //   const query = "UPDATE bomb SET second_retrace_wave = ? WHERE bomb_date = ?"
  //   const queryValues = [
  //     JSON.stringify(stat.secondRetraceWave),
  //     formatMysqlDate(stat.general.date.start)
  //   ]

  //   const p = () => new Promise((resolve) => {
  //     conn.query(query, queryValues, (e) => {
  //       if (e) { console.error(e) }

  //       resolve()
  //     })
  //   })

  //   try {
  //     await p()
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  conn.end();

  if (uploadToDB) await uploadBombStats(stats);
})();
