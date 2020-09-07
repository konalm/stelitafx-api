const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const cron = require("node-cron");

const getCandles = require("@/services/oanda/getCandles");
const getBombs = require("@/services/getBombs");
const config = require("@/config");

const abbrev = "EUR/JPY";
const gran = "H1";

cron.schedule("1 * * * *", async () => {
  sendNotification();
});

/**
 *
 */
const emailNotification = (currencyPairBombs) => {
  const templateString = fs.readFileSync(
    "./emailTemplate/bombNotification.ejs",
    "utf-8"
  );
  const html = ejs.render(templateString, {
    currencyPairBombs,
    // bombSetup: latestDateIsStageTwo,
    // bomb: latestDateIsBomb,
  });

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "connorlloydmoore@gmail.com",
      pass: config.EMAIL_PASSW,
    },
  });
  const mailOptions = {
    from: config.SENDER_EMAIL,
    to: "connor@codegood.co",
    subject: "Bomb notifaction",
    html,
  };

  transporter.sendMail(mailOptions, (e) => {
    if (e) console.log(e);
  });
};

/**
 *
 */
const sendNotification = async () => {
  const abbrevs = config.BOMB_CURRENCYPAIRS;
  const currencyPairBombs = [];

  for (let i = 0; i < abbrevs.length; i++) {
    const abbrev = abbrevs[i];

    const candles = await getCandles(gran, abbrev, 200);
    const latestDate = candles[candles.length - 1].date;
    const { impulseWaves, stageOne, stageTwo, bombs } = getBombs(
      candles,
      abbrev
    );
    const lastBomb = bombs[bombs.length - 1];
    const lastStageTwo = stageTwo[stageTwo.length - 1];

    const latestDateIsStageTwo = lastStageTwo.secondRetraceWave.candles
      .map((x) => x.date)
      .includes(latestDate);

    const latestDateIsBomb = lastBomb.trendAlignedWave.candles
      .map((x) => x.date)
      .includes(latestDate);

    currencyPairBombs.push({
      abbrev,
      bombSetup: latestDateIsStageTwo,
      bomb: latestDateIsBomb,
    });
  }

  emailNotification(currencyPairBombs);
};
