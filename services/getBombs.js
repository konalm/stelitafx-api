const getImpulseWaves = require("../operation/bombScanner/service/impulseWaveScan");
const getStageOne = require("../operation/bombScanner/service/stageOneScan");
const getStageTwo = require("../operation/bombScanner/service/stageTwoScan");
const getValidBombs = require("../operation/bombScanner/service/validBombScan");

module.exports = (candles, abbrev) => {
  const impulseWaves = getImpulseWaves(candles, abbrev);
  const stageOne = getStageOne(impulseWaves, candles, abbrev);
  const stageTwo = getStageTwo(stageOne, candles);
  const bombs = getValidBombs(stageTwo, candles);

  // stageTwo.forEach((x) => {
  //   console.log(x.impulseWave.date.start);
  // });

  return {
    impulseWaves,
    stageOne,
    stageTwo,
    bombs,
  };
};
