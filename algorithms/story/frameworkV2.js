const fs = require('fs');
const { getLastStep, createTradeStoryStep, closeTradeStory  } = require('../../tradeStory/repository')
const tradeMongoRepo = require('../../trade/mongoRepository')
const { openTrade, closeTrade } = require('../../trade/service')
const triggers = require('./triggers')
const uuidGen = require('uuid/v1')


module.exports = async (algorithm, data) => {
  console.log('Story Framework !!')
  console.log(data)

  /* 1. Read prototype */
  let storyPrototype
  try {
   storyPrototype = JSON.parse(
      fs.readFileSync(`${__dirname}/storyPrototype#${algorithm.prototype}.json`, 'utf8')
    )
  } catch (e) {
   throw new Error(`Failed to read story prototype #${algorithm.prototype}`)
 }

  /* 2. Get the prototype current step */
  let prototypeStep 
  try {
    prototypeStep = await getPrototypeCurrentStep(storyPrototype, algorithm)
  } catch (e) {
    console.log(e)
    throw new Error('Failed to get prototype step')
  }

  /* 3. Check if prototype completed current step */
  const currentStepComplete = checkIndicatorsTriggered(prototypeStep.indicators, data)
  if (!currentStepComplete) return
  // console.log('3. current step is complete')

  console.log('completed a step :)')

  /* 4. Step complete? audit the completed step */
  try {
    createTradeStoryStep(algorithm, prototypeStep.storyId, prototypeStep.step, false)
  } catch (e) {
    throw new Error(`Failed to create trade story step: ${e}`)
  }

  /* 5. Action ? open or close trade */ 
  if (!prototypeStep.finalStep) return 
  try {
    await actOnPrototypeStep(prototypeStep.stepType, algorithm, data, prototypeStep.storyId)
  } catch (e) {
    console.log(e)
    throw new Error('Failed to act on prototype step')
  }
}


/**
 * 
 */
const checkIndicatorsTriggered = (indicators, data) => {
  let triggered = false 

  indicators.forEach((x) => {
    if (triggered) return 
    if (indicatorTriggered(x, data)) triggered = true
  })

  return triggered
}


/**
 * 
 */
const actOnPrototypeStep = async (stepType, algorithm, data, storyId) => {
  console.log('Act on story prototype')
  const { prototype, interval, abbrev } = algorithm
  const currency = abbrev.substring(0,3)

  if (stepType === 'openSteps') {
    console.log('Story .. open trade')
    console.log(prototype, currency, data.rates.current, '', '', interval, '')

    try {
      await openTrade(prototype, currency, data.rates.current, '', '', interval, '')
    } catch (e) {
      console.log(e)
      throw new Error('Failed to open trade')
    }
  }
  
  else if (stepType === 'closeSteps') {
    try {
      await closeTradeStory(storyId)
    } catch (e) {
      console.log(e)
      throw new Error('Failed to close trade story')
    }

    let openingTrade;
    try {
      openingTrade = await tradeMongoRepo.getLastTrade(prototype, abbrev, interval)
    } catch (e) {
      console.log(e)
      throw new Error(`Failed to get last trade for ${JSON.stringify(algorithm)}`)
    }

    if (!openingTrade || openingTrade.closed) {
      throw new Error('last trade is already closed!')
    }

    try {
      await closeTrade(prototype, abbrev, data.rates.current, '', interval, openingTrade, '')
    } catch (e) {
      console.log(e)
      throw new Error('Failed to close trade')
    }
  }

  else {
    throw new Error('Failed to act on prototype step an neither open or close type')
  }
}


/**
 * 
 */
const getPrototypeCurrentStep = async (storyPrototype, algorithm) => {
  let lastStep 
  try {
    const { prototype, interval, abbrev } = algorithm
    lastStep = await getLastStep(prototype, interval, abbrev) 
  } catch (e) {
    throw new Error('Failed to get last step')
  }
  const currentStep = lastStep ? lastStep.step + 1 : 1
  
  const prototypeInOpenSteps = storyPrototype.openSteps.findIndex(x => x.step === currentStep) >= 0
  const prototypeInCloseSteps = storyPrototype.closeSteps.findIndex(x => x.step === currentStep) >= 0

  const getPrototypeInSteps = (stepsType) => {
    const steps = storyPrototype[stepsType]
    const prototypeStep = steps.find(x => x.step === currentStep)
    prototypeStep.stepType = stepsType
    prototypeStep.finalStep = prototypeStep.step === steps[steps.length - 1].step 
    return prototypeStep
  }
  
  let prototypeStep 
  if (prototypeInOpenSteps) prototypeStep = getPrototypeInSteps('openSteps')
  else if (prototypeInCloseSteps) prototypeStep = getPrototypeInSteps('closeSteps')
  else throw new Error('Failed to identify prototype step')

  prototypeStep.storyId = currentStep !== 1 ? lastStep.storyId : uuidGen()

  return prototypeStep
}


/**
 * 
 */
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