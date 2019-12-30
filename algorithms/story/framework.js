const fs = require('fs');
const uuidGen = require('uuid/v1')
const conn = require('../../db')
const tradeMongoRepo = require('../../trade/mongoRepository')
const { 
  getLastStep, createTradeStoryStep, closeTradeStory 
} = require('../../tradeStory/repository')
const { openTrade, closeTrade } = require('../../trade/service')
const triggres = require('./triggers')


module.exports = async (algorithm, data) => {
  console.log('story framework')

  // Read algorithm 
  let storyPrototype
   try {
    storyPrototype = JSON.parse(
       fs.readFileSync(`${__dirname}/storyPrototype#${algorithm.prototype}.json`, 'utf8')
     )
   } catch (e) {
    throw new Error(`Failed to read story prototype #${algorithm.prototype}`)
  }

  console.log('read algorithm')

  let lastTrade;
  try {
    lastTrade = await tradeMongoRepo.getLastTrade(
      algorithm.prototype, 
      algorithm.abbrev, 
      algorithm.interval
    )
  } catch (e) {
    throw new Error(`Failed to get last trade for ${JSON.stringify(algorithm)}`)
  }

  console.log('last trade')
  console.log(lastTrade)

    /* proceed via opening branch */
  if (!lastTrade || lastTrade.closed) {
    console.log('no last trade or last trade closed')

    try {
      await openBranch(storyPrototype, algorithm, data)
    } catch (e) {
      console.log(e)
      throw new Error('Failed to process open branch')
    }
    return 
  }

  console.log('is last trade & not closed')

  /* proceed via closing branch */
  try {
    await closeBranch(storyPrototype, algorithm, lastTrade, data)
  } catch (e) {
    throw new Error('Failed to process close branch')
  }
}


const openBranch = async (storyPrototype, algorithm, data) => {
  console.log('OPEN BRANCH')

  // Get prototype current step 
  let prototypeStep 
  try {
    prototypeStep = await getPrototypeCurrentStep(storyPrototype, 'openSteps', algorithm)
  } catch (e) {
    console.log(e)
    throw new Error('Failed to get prototype step')
  }
  if (!prototypeStep) {
    console.log('Failed to find step in prototype steps. Restarted')
    prototypeStep = storyPrototype.openSteps[0]
  }

  console.log('got prototype step')
  console.log(prototypeStep)

  const storyId = prototypeStep.step === 1 ? uuidGen() : prototypeStep.storyId

  console.log('story id ....' + storyId)
  
  // Store completed step 
  const currentStepComplete = checkIndicatorsTriggered(prototypeStep.indicators, data)

  console.log('current step complete ... ' + currentStepComplete)

  if (!currentStepComplete) return

  try {
    createTradeStoryStep(algorithm, storyId, prototypeStep.step, false)
  } catch (e) {
    throw new Error(`Failed to create trade story step: ${e}`)
  }

  console.log('audited trade story step ' + prototypeStep.step)

  /* Open trade */ 
  const action = prototypeStep.hasOwnProperty("action") ? prototypeStep.action : ''

  console.log(`action .. ${action}`)

  if (action !== 'open') return
  try {
    const { prototype, interval, abbrev } = algorithm
    const currency = abbrev.substring(0,3)
    await openTrade(prototype, currency, data.rates.current, '', '', interval, '')
  } catch (e) {
    console.log(e)
    throw new Error('Failed to open trade')
  }

  console.log('OPENED TRADE')
}


const closeBranch = async (storyPrototype, algorithm, openingTrade, data) => {
  console.log('CLOSE BRANCH')

  // Get prototype current step 
  let prototypeStep 
  try {
    prototypeStep = await getPrototypeCurrentStep(storyPrototype, 'closeSteps')
  } catch (e) {
    return new Error('Failed to get prototype step')
  }

  console.log('prototype step >>')
  console.log(prototypeStep)
    
  let closeTrade = false 
  const action = prototypeStep.hasOwnProperty("action") ? prototypeStep.action : ''
  if (action === 'close') closeTrade = true

  console.log('close trade ... ' + closeTrade)
  
  // Store completed step 
  const currentStepComplete = checkIndicatorsTriggered(prototypeStep.indicators, data)
  if (!currentStepComplete) return

  console.log('current step complete')

  try {
    const { prototype, interval, abbrev } = algorithm
    createTradeStoryStep(prototype, interval, abbrev, storyId, prototypeStep.step, closeTrade)
  } catch (e) {
    throw new Error(`Failed to create trade story step: ${e}`)
  }

  console.log('audited trade story step .. ' + prototypeStep.step)

  /* Close trade */ 
  if (!closeTrade) return 
  try {
    await closeTrade(prototypeNo, abbrev, data.rates.current, '', interval, openingTrade, '')
  } catch (e) {
    console.log(e)
    throw new Error('Failed to close trade')
  }

  console.log('CLOSED TRADE')
}


const getPrototypeCurrentStep = async (storyPrototype, steps, algorithm) => {
  let lastStep 
  try {
    const { prototype, interval, abbrev } = algorithm
    lastStep = await getLastStep(prototype, interval, abbrev) 
  } catch (e) {
    throw new Error('Failed to get last step')
  }
  let currentStep = lastStep ? lastStep.step + 1 : 1

  let prototypeStep = storyPrototype[steps].find(x => x.step === currentStep)
  if (!prototypeStep) return false

  prototypeStep.storyId = lastStep.storyId

  return prototypeStep
}


const checkIndicatorsTriggered = (indicators, data) => {
  let triggered = false 

  indicators.forEach((x) => {
    if (triggered) return 
    if (indicatorTriggered(x, data)) triggered = true
  })

  return triggered
}


const indicatorTriggered = (indicator, data) => {
  let triggered

  switch (indicator.name) {
    case 'stochasticBelow':
      triggered = triggers.stochasticBelow(data, indicator.param)
      break
    case 'multiple':
      triggered = triggers.multiple(indicator, data)
      break
    case 'stochasticAbove':
      triggered = triggers.stochasticAbove(data, indicator.param)
      break
    case 'stochasticRemained':
      triggered = triggers.stochasticRemained(data)
      break
    case 'stochasticDecreased':
      triggered = triggers.stochasticDecreased(data)
    case 'stochasticIncreased':
      triggered = triggers.stochasticIncreased(data)
  }

  return triggered
}
