const { get: getPublishedAlgortihm } = require('../publishedAlgorithm/repository') 

const isPublishedAlgorithm = async (prototypeNo, timeInterval) => {
  let publishedAlgortihm
  try {
    publishedAlgorithm = await getPublishedAlgortihm(prototypeNo, timeInterval)
  } catch (e) {
    throw new Error('Failed to get published algorithm')
  }

  return publishedAlgortihm.length > 0
}