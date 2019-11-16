const prototype = require('./prototype');
const prototypeNo11 = require('./prototype#11');
const prototypeNo12 = require('./prototype#12');
const prototypeNo13 = require('./prototype#13');
const prototypeNo2 = require('./prototype#2');
const prototypeNo3 = require('./prototype#3');
const prototypeNo4 = require('./prototype#4');
const prototypeNo5 = require('./prototype#5');
const prototypeNo51 = require('./prototype#51');
const prototypeNo6 = require('./prototype#6');
const prototypeNo7 = require('./prototype#7');
const prototypeNo14 = require('./prototype#14');
const prototypeNo15 = require('./prototype#15');
const prototypeNo16 = require('./prototype#16');
const prototypeNo71 = require('./prototype#71');
const prototypeNo72 = require('./prototype#72');
const prototypeNo73 = require('./prototype#73');
const prototypeNo74 = require('./prototype#74');

module.exports = (timeInterval, currencyRateSource) => new Promise((resolve, reject) => {
  Promise.all([
    prototype(timeInterval, currencyRateSource),
    prototypeNo11(timeInterval, currencyRateSource),
    prototypeNo12(timeInterval, currencyRateSource),
    prototypeNo13(timeInterval, currencyRateSource),
    prototypeNo2(timeInterval, currencyRateSource),
    prototypeNo3(timeInterval, currencyRateSource),
    prototypeNo4(timeInterval, currencyRateSource), 
    prototypeNo5(timeInterval, currencyRateSource),
    prototypeNo51(timeInterval, currencyRateSource),
    prototypeNo6(timeInterval, currencyRateSource),
    prototypeNo7(timeInterval, currencyRateSource),
    prototypeNo14(timeInterval,  currencyRateSource),
    prototypeNo15(timeInterval, currencyRateSource),
    prototypeNo16(timeInterval, currencyRateSource),
    prototypeNo71(timeInterval, currencyRateSource),
    prototypeNo72(timeInterval, currencyRateSource),
    prototypeNo73(timeInterval, currencyRateSource),
    prototypeNo74(timeInterval, currencyRateSource)
  ])
    .then(() => {
      // console.log('all prototypes complete ???')
      resolve()
    })
    .catch((e) => {
      console.log('all prototypes complete ??? CATCH !!!')
      reject()
    })
})
