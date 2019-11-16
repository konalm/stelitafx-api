const repository = require('./repository')

exports.createChartingWMAOption = async (req, res) => {
  const description = req.body.description
  if (!description) return res.status(400).send('Description required') 

  let chartingWMAOption
  try {
    chartingWMAOption = await repository.createChartingWMAOption(description)
  } catch (e) {
    return res.status(500).send('Failed to create charting wma option')
  }

  return res.send(chartingWMAOption)
}


exports.updateChartingWMAOptions = async (req, res) => {
  const uuid = req.params.uuid
  
  const { jsonPayload } = req.body
  const data = {
    options_json: jsonPayload
  }

  try {
    await repository.updateChartingWMAOption(uuid, data)
  } catch (e) {
    return res.status(500).send('Failed to update charting WMA options')
  }

  return res.send(`updated ${uuid} with ${JSON.stringify(data)}`)
}


exports.getChartingWMAOptions = async (_, res) => {
  let chartingWMAOptions
  try {
    chartingWMAOptions = await repository.getChartingWMAOptions()
  } catch (e) {
    return res.status(500).send('Failed to get charting wma options')
  }

  return res.send(chartingWMAOptions)
}


exports.getChartingWMAOptionsItem = async (req, res) => {
  const uuid = req.params.uuid

  let chartingWMAOption
  try {
    chartingWMAOption = await repository.getChartingWMAOptionItem(uuid)
  } catch (e) {
    return res.status(500).send('Failed get charting WMA option')
  }

  return res.send(chartingWMAOption)
}