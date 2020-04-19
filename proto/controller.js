const repo = require('./repository')
const tradeRepo = require('@/trade/repository')
const indicators = require('../algorithms/indicators')
const service = require('./service')


exports.getAlgorithmStats = async (req, res) => {
  const { id, interval } = req.params
  const sinceDate = req.query.sinceDate || ''

  let algo 
  try {
    algo = await repo.getProtoById(id)
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get algorithm')
  }

  console.log('algo >>')
  console.log(algo)

  const tradeConditions = {
    proto_no: parseInt(algo.protoNo),
    time_interval: interval,
    closed: true
  }
  let trades 
  try {
    trades = await tradeRepo.getTrades(tradeConditions, sinceDate)
  } catch (e) {
    return res.status(500).send('Failed to get trades')
  }

  const performance = service.getAlgorithmPerformance(trades) 

  return res.send({ ...algo, performance })
}


/**
 * Get all prototypes
 */
exports.getProtos = async (_, res) => {
  let protos;
  try {
    protos = await repo.getProtos;
  } catch (err) {
    return res.status(500).send(err);
  }

  return res.send(protos);
}


/**
 * Get a prototype
 */
exports.getProto = async (req, res) => {
  const protoNo = req.params.protoNo;

  let proto;
  try {
    proto = await repo.getProto(protoNo);
  } catch (err) {
    console.log(err)
    return res.status(500).send('Error getting prototype');
  }

  if (!proto) return res.status(404).send(`no prototype found with no ${protoNo}`);

  return res.send({
    prototypeNo: proto.prototype_no,
    dateCreated: proto.date_created,
    description: proto.description
  });
}


exports.getProtoIntervalCurrencyData = async (req, res ) => {
  const {protoNo, interval, currency} = req.params;
  const abbrev = `${currency}/USD`

  let dataForIndicators
  try {
    dataForIndicators = await indicators.dataForIndicators(protoNo, abbrev, interval)
  } catch (e) {
    return res.send(`Failed to get data for indicator`)
  }

  indicatorsTriggered = indicators.indicators(dataForIndicators)

  return res.send(indicatorsTriggered)
}
