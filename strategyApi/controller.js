const repository = require('./repository');


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

  const strategyUuid = req.params.strategyUUID
  const masterAlgoUuid = req.params.masterAlgoUUID

  console.log(`strategy uuid .. ${strategyUuid}`)
  console.log(`master algo uuid .. ${masterAlgoUuid}`)

  let masterAlgo
  try {
    masterAlgo = await repository.getMasterAlgorithm(strategyUuid, masterAlgoUuid)
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get strategy master algo')
  }

  return res.send(masterAlgo)
}