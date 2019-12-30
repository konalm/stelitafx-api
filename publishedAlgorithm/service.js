const { get: getPublishedAlgortihm } = require('../publishedAlgorithm/repository') 

exports.isPublishedAlgorithm = async (prototypeNo, timeInterval) => {
  let publishedAlgorithm
  try {
    publishedAlgorithm = await getPublishedAlgortihm(prototypeNo, timeInterval)
  } catch (e) {
    throw new Error('Failed to get published algorithm')
  }

  return publishedAlgorithm && publishedAlgorithm.length > 0 
    ? true 
    : false;
}