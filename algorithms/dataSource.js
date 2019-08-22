const service = require('./service');
const tradeRepo = require('../trade/repository');
const calculatePip = require('../services/calculatePip');


/**
 * Weighted moving averages 
 * Current rate of abbrev 
 * opening trade 
 * abbrev rate when trade was opened 
 */
module.exports = async (protoNo, abbrev) => {
  try {
    const WMAs = await service.getCurrentAndPrevWMAs(abbrev)
    const currentRate = WMAs.WMA 
      ? WMAs.WMA.rate 
      : null
    const openingTrade = await tradeRepo.getLastTrade(protoNo, abbrev)
    const openingRate = openingTrade && !openingTrade.closed
      ? openingTrade.openRate
      : null
    const pip = openingTrade && currentRate
      ? calculatePip(openingRate, currentRate, abbrev)
      : 0
    
    return { 
      WMAs, 
      currentRate, 
      openingTrade,
      pip
    }
  }
  catch (e) { throw err(e) }
}