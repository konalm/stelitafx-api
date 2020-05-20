const repository = require('./repository');
const protoRepo = require('@/proto/repository')
const { 
  getAlgorithmTradesPerformances, algorithmsPerformanceSummary 
} = require('@/proto/service')

exports.getStrategies = async (req, res) => {
  let strategies
  try {
    strategies = await repository.list()
  } catch (e) {
    return res.status(500).send('Failed to get strategies')
  }

  return res.send(strategies)
}


exports.getStrategy = async (req, res) => {
  const uuid = req.params.uuid

  let strategy
  try {
    strategy = await repository.get(uuid)
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get strategy')
  }

  return res.send(strategy)
}


exports.getStrategyMasterAlgo = async (req, res) => {
  console.log('get strategy master algo !!')

  const strategyUUID = req.params.strategyUUID
  const masterAlgoUUID = req.params.masterAlgoUUID

  console.log(`strategy uuid .. ${strategyUUID}`)
  console.log(`master algo uuid .. ${masterAlgoUUID}`)

  let masterAlgo
  try {
    masterAlgo = await repository.getMasterAlgorithm(strategyUUID, masterAlgoUUID)
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get strategy master algo')
  }
  
  return res.send(masterAlgo)
}


/**
 * 
 */
exports.getStrategyStats = async (req, res) => {
  console.log('get strategy stats')

  const { strategyUUID, interval } = req.params 
  const sinceDate = req.query.sinceDate || ''

  let algos 
  try {
    algos = await protoRepo.getStrategyAlgos(strategyUUID)
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get strategy algos')
  }

  const promises = []
  algos.forEach((algo) => {
    promises.push(getAlgorithmTradesPerformances(algo.prototypeNo)(interval)(sinceDate))
  })

  let performances
  try {
    performances = await Promise.all(promises)
  } catch (e) {
    return res.status(500).send('Failed to get performances')
  }


  return res.send(algorithmsPerformanceSummary(performances))
}