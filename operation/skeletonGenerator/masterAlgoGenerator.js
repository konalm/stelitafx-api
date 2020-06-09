require('module-alias/register');

const uuidGen = require('uuid/v1')
const db = require('@/dbInstance');
const config = require('@/config');
const mapSymbolToPrototypeNo = require('@/services/mapSymbolToPrototypeNo')

const strategyUUID = 'f74c7ad0-a133-11ea-a442-c395a045d322';
const description = 'WMA Long'
const no = 9400


/**
 * 
 */
const createAlgorithm = (masterAlgoUUID, masterAlgoDesc, masterAlgoNo, currencyPair) => 
  new Promise((resolve,reject) => 
{
  const conn = db()

  const data = {
    prototype_no: masterAlgoNo + mapSymbolToPrototypeNo[currencyPair],
    description: `${masterAlgoDesc} ${currencyPair}` ,
    ref: `${masterAlgoUUID}__${currencyPair}`, 
    master_algorithm: masterAlgoUUID
  }
  conn.query('INSERT INTO algorithm SET ?', data, (e) => {
    conn.end()

    if (e) return reject(e)
    resolve()
  })
});


/**
 * 
 */
(async () => {
  const conn = db()
  const UUID = uuidGen()
  const data = { 
    UUID, 
    description, 
    strategy_uuid: strategyUUID,
    no
  }
  conn.query('INSERT INTO master_algorithm SET ?', data, (e) => {
    conn.end()

    if (e) return reject(e)
  })

  /* Create algorithm for each currency pair */ 
  const createAlgorithmPromises = []
  config.CURRENCYPAIRS.forEach((x) => {
    createAlgorithmPromises.push(createAlgorithm(UUID, description, no, x))
  })

  try {
    await Promise.all(createAlgorithmPromises)
  } catch (e) {
    return reject(e)
  }

  process.exit();
})();

