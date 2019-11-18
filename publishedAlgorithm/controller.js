const repository = require('./repository')

exports.getPublishedAlgorithms = async (req, res) => {
  let publishedAlgorithms 
  try {
    publishedAlgorithms = await repository.getAll()
  } catch (e) {
    return res.status(500).send('Failed to get published algorithms')
  }

  return res.send(publishedAlgorithms)
}