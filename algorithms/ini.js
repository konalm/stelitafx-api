const prototype = require('./prototype');
const prototypeNo2 = require('./prototype#2');
const prototypeNo3 = require('./prototype#3');
const prototypeNo4 = require('./prototype#4');
const prototypeNo5 = require('./prototype#5');
const prototypeNo51 = require('./prototype#51');
const prototypeNo6 = require('./prototype#6');
const prototypeNo7 = require('./prototype#7');
const prototypeNo71 = require('./prototype#71');
const prototypeNo72 = require('./prototype#72');
const prototypeNo73 = require('./prototype#73');
const prototypeNo74 = require('./prototype#74');

module.exports = (timeInterval, currencyRateSource) => {
  prototype(timeInterval, currencyRateSource)
  prototypeNo2(timeInterval, currencyRateSource)
  prototypeNo3(timeInterval, currencyRateSource)
  prototypeNo4(timeInterval, currencyRateSource)
  prototypeNo5(timeInterval, currencyRateSource)
  prototypeNo51(timeInterval, currencyRateSource)
  prototypeNo6(timeInterval, currencyRateSource)
  prototypeNo7(timeInterval, currencyRateSource)
  prototypeNo71(timeInterval, currencyRateSource)
  prototypeNo72(timeInterval, currencyRateSource)
  prototypeNo73(timeInterval, currencyRateSource)
  prototypeNo74(timeInterval, currencyRateSource)
}
