const { spawn } = require("child_process");
const cron = require("node-cron");
const config = require("./config");
const insertCurrencyRates = require("./updateCurrencyRates/insertCurrencyRates");
const implementStops = require("./algorithms/stopLoss");
const dbConnGarbageCollector = require("./dbConnGarbageCollector");
// const algorthmStoryPipeline = require('./algorithms/storyPipeline')
// const dbConnections = require('./dbConnections')
// const uploadHistoricTrades = require('./xtb/services/uploadHistoricTrades')
const uploadCandles = require("@/candle/service/populateCandles");

// implementStrategyStops()

cron.schedule("* * * * *", async () => {
  return;

  // (async () => {
  const d = new Date();
  const min = d.getMinutes();
  const hour = d.getHours();

  try {
    await dbConnGarbageCollector();
  } catch (e) {
    console.error(e);
  }

  try {
    await insertCurrencyRates(d);
  } catch (err) {
    console.log(err);
  }

  try {
    await uploadCandles(min);
  } catch (e) {
    console.log(`Failed to upload candle on ${min}: e`);
  }

  // try {
  //   await implementStops()
  // } catch (e) {
  //   console.error(`Failed to implement stop losses: ${e}`)
  // }

  try {
    await implementStrategyStops();
  } catch (e) {
    console.log(`Failed to implment strategy stops`);
  }

  console.log("-----------------------------------------------------------");

  const intervalsToRun = [];
  config.TIME_INTERVALS.forEach((timeInterval) => {
    if (min % timeInterval === 0) intervalsToRun.push(timeInterval);
  });

  const gransToRun = [];
  config.GRANS.forEach((gran) => {
    if (min === 0) {
      if (gran % hour === 0) gransToRun.push(gran);
    }
  });

  console.log(`intervals to run ... ${intervalsToRun.length}`);

  let intervalsComplete = 0;
  intervalsToRun.forEach((interval) => {
    const spawnedProcess = spawn("node", ["processInterval", interval]);

    spawnedProcess.stdout.on("data", (data) => {
      console.log(data.toString());
    });
  });

  console.log(`grans to run ... ${gransToRun.length}`);

  gransToRun.forEach((gran) => {
    const spawnedProcess = spawn("node", ["processGran", gran]);

    spawnedProcess.stdout.on("data", (data) => {
      console.log(data.toString());
    });
  });
});
