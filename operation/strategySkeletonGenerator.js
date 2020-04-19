require('module-alias/register');

const yargs = require('yargs');
const uuidGen = require('uuid/v1')
const db = require('@/dbInstance');
const config = require('@/config');
const mapSymbolToPrototypeNo = require('@/services/mapSymbolToPrototypeNo')

const args = yargs.argv;

const createStrategy = (UUID, name, description) => new Promise((resolve, reject) => {
  const conn = db()
  const data = { UUID, name, description }

  conn.query('INSERT INTO strategy SET ?', data, (e) => {
    conn.end()

    if (e) return reject(e)
    resolve()
  })
});


const createMasterAlgorithm = (description, strategyUUID) => 
  new Promise(async (resolve, reject) => 
{
  const conn = db()
  const UUID = uuidGen()
  const no =  Math.floor(1000 + Math.random() * 9000)
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

  resolve()
});


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


(async() => {
  const strategyName = args.n
  const strategyDescription = args.d 
  const strategyUUID = uuidGen()

  try {
    await createStrategy(strategyUUID, strategyName, strategyDescription)
  } catch (e) {
    return console.error(e)
  }

  const masterAlgos = args.m.split(",")

  const masterAlgoPromises = []
  masterAlgos.forEach((x) => {
    masterAlgoPromises.push(createMasterAlgorithm(x, strategyUUID))
  })

  try {
    await Promise.all(masterAlgoPromises)
  } catch (e) {
    return console.error(e)
  }

  process.exit();
})();