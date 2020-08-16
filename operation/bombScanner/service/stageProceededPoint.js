exports.highPoint = (stage, candle) => {
  // console.log(`exceeded high point ???? .. ${stage.highPoint}`)

  if (stage.trend === 'up') {
    if (candle.high >= stage.highPoint) return true
  }

  if (stage.trend === 'down') {
    if (candle.low <=  stage.highPoint) return true 
  }

  return false
}


exports.startOfImpulse = (stageOne, candle) => {
  if (stageOne.trend === 'up') {
    if (candle.low < stageOne.startPoint) return true
  }

  if (stageOne.trend === 'down') {
    if (candle.high > stageOne.startPoint) return true
  }

  return false
}


exports.lowPoint = (stageOne, candle) => {
  if (stageOne.trend === 'up') {
    if (candle.low < stageOne.lowPoint) return true
  }

  if (stageOne.trend === 'down') {
    if (candle.high > stageOne.lowPoint) return true
  }

  return false
}
