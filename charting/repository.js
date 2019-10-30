const uuidGen = require('uuid/v1')
const conn = require('../db')

const table = 'charting_wma_options';

exports.createChartingWMAOption = (description) => new Promise((resolve, reject) => {
  const uuid = uuidGen()
  const query = `INSERT INTO ${table} SET ?`
  const data = {
    uuid,
    description
  }
  conn.query(query, data, (e) => {
    if (e) return reject(`Failed to insert into charting wma options: ${e}`)

    resolve(uuid)
  })
})


exports.updateChartingWMAOption = (uuid, data) => new Promise((resolve, reject) => {
  if (!uuid) return reject('uuid required')

  const query = `UPDATE ${table} SET ? WHERE uuid = ?`
  const queryValues = [data, uuid]

  conn.query(query, queryValues, (e) => {
    if (e) return reject('Failed to update charting wma options')

    resolve('updated charting wma option')
  })
})


exports.getChartingWMAOptions = () => new Promise((resolve, reject) => {
  const query = `
    SELECT uuid, description, options_json, date
    FROM ${table}
  `
  conn.query(query, (e, results) => {
    if (e) return reject('Failed to get charting wma options')

    resolve (results)
  })
})


exports.getChartingWMAOptionItem = (uuid) => new Promise((resolve, reject) => {
  const query = `
    SELECT uuid, description, options_json, date
    FROM ${table}
    WHERE uuid = ?
  `
  conn.query(query, [uuid], (e, results) => {
    if (e) return reject(`Failed to get charting wma option item: ${e}`)

    resolve(results[0])
  })
})