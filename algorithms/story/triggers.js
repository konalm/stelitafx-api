exports.multiple = (indicator, data) => {
  let triggered = true
  indicator.indicators.forEach((x) => {
    if (!triggered) return     
    if (!indicatorTriggered(x, data)) triggered = false
  })

  return triggered
}


exports.stochasticBelow = (data, stochastic) => data.stochastics.current <= stochastic 
  ? true 
  : false 


exports.stochasticRemained = (data) => data.stochastics.current === data.stochastics.previous


exports.stochasticAbove = (data, stochastic) => data.stochastics.current >= stochastic 
  ? true 
  : false

  
exports.stochasticDecreased = (data) => data.stochastics.current < data.stochastics.previous


exports.stochasticIncreased = (data) => data.stochastics.current > data.stochastics.previous