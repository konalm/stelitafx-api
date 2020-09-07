const _ = require('lodash')

module.exports = (haCandles) => {
  const groups = getGroups(haCandles)
  const candles = _.cloneDeep(haCandles)

  // console.log(`candle upper trends -->`)
  // console.log(candles[0].date.toISOString())

  candles.forEach((candle, i) => {
    const relevantGroupIndex = groups.findIndex((group) => 
      group.candles.findIndex((x) => x.date.getTime() === candle.date.getTime()) > -1
    )

    const lastImpulse = getLastImpulse(relevantGroupIndex, groups)

    /* no last impulse ? trend is that of candle */ 
    if (!lastImpulse) {
      candle.upperTrend = candle.dir
      return 
    }

    // if (candle.date.toISOString() == '2020-02-28T13:00:00.000Z') {
    //   console.log(`observing candle 12:00`)
    //   console.log(candle.dir === lastImpulse.trend)
    //   console.log(`candle dir .. ${candle.dir}`)

    //   const group = groups[relevantGroupIndex]
    //   const candles = group.candles.filter((x) => x.date <= candle.date)

    //   console.log('candles -->')
    //   console.log(candles)

    //   console.log('bottom low -->')
    //   console.log(Math.min(...candles.map((x) => x.low)))

    //   console.log('last impulse low -->')
    //   console.log(lastImpulse.low)
    // }

    /* candle in same direction as last impulse trend ? keep trend */
    if (candle.dir === lastImpulse.trend) {
      candle.upperTrend = lastImpulse.trend
      return 
    } else {
      const group = groups[relevantGroupIndex]
      const candles = group.candles.filter((x) => x.date <= candle.date)

      /* candle or prior candle in trend broke PA of impulse ? change trend dir */ 
      if (candle.dir === 'up') {
        const topHeight = Math.max(...candles.map((x) => x.high))
        if (topHeight > lastImpulse.high) {
          candle.upperTrend = 'up'
        } else {
          candle.upperTrend = 'down'
        }
      }
  
      else {
        const bottomLow = Math.min(...candles.map((x) => x.low))
        if (bottomLow < lastImpulse.low) {
          candle.upperTrend = 'down'
        } else {
          candle.upperTrend = 'up'
        }
      }
    }

    if (candle.date.toISOString() == '2020-02-28T13:00:00.000Z') {
      console.log(`candle upper trend ---->`)
      console.log(candle.upperTrend)
    }

    // console.log('candle uppertrend ---->')
    // console.log(candle.upperTrend)

  })

  // console.log(`CANDLES ---->`)
  // console.log(candles)

  return candles
}


/**
 * 
 */
const getLastImpulse = (relevantGroupIndex, groups) => {
  // console.log(`relevant group index .. ${relevantGroupIndex}`)

  switch (relevantGroupIndex) {
    case 0:
      return null 
    case 1:
      return groups[relevantGroupIndex - 1] 
    default: 
      const priorGroup =  groups[relevantGroupIndex - 1]
      const priorPriorGroup =  groups[relevantGroupIndex - 2]

      return priorGroup.height >= priorPriorGroup.height 
        ? priorGroup 
        : priorPriorGroup
  }
}

/**
 * 
 */
const getGroups = (candles) => {
  const groups = []

  candles.forEach((candle, i) => {
    if (i === 0) {
      groups.push(newGroup(candle))
      return 
    }

    const lastGroup = groups[groups.length - 1]

    /* direction changed, close group & start new group */
    if (candle.dir !== lastGroup.dir) {
      Object.assign(lastGroup, closeGroup(lastGroup, candle))
      groups.push(newGroup(candle))
    } else {
      lastGroup.candles.push(candle)
    }

    /* last candle, close of group */ 
    if (i === candles.length - 1) Object.assign(lastGroup, closeGroup(lastGroup, candle))
  })

  return groups
}


/**
 * 
 */
const closeGroup = (group, candle) => {
  const high = Math.max(...group.candles.map((x) => x.high))
  const low = Math.min(...group.candles.map((x) => x.low))

  return {
    date: {
      start: group.date.start,
      end: candle.date
    },
    high,
    low,
    height: Math.abs(high - low),
    candles: group.candles
  }
}


/**
 * 
 */
const newGroup = (candle) => {
  return {
    dir: candle.dir,
    candles: [candle],
    date: { start: candle.date }
  }
}