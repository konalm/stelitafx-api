const uuidGen = require('uuid/v1')
// const conn = require('../db')
const db = require('../dbInstance');


const table = 'charting_wma_options';

exports.createChartingWMAOption = (description) => new Promise((resolve, reject) => {
  const dbConn = db()
  const uuid = uuidGen()
  const query = `INSERT INTO ${table} SET ?`
  const data = {
    uuid,
    description
  }
  dbConn.query(query, data, (e) => {
    if (e) return reject(`Failed to insert into charting wma options: ${e}`)

    resolve(uuid)
  })
  dbConn.end()
})


exports.updateChartingWMAOption = (uuid, data) => new Promise((resolve, reject) => {
  if (!uuid) return reject('uuid required')

  const query = `UPDATE ${table} SET ? WHERE uuid = ?`
  const queryValues = [data, uuid]

  const dbConn = db()
  dbConn.query(query, queryValues, (e) => {
    if (e) return reject('Failed to update charting wma options')

    resolve('updated charting wma option')
  })
  dbConn.end()
})


exports.getChartingWMAOptions = () => new Promise((resolve, reject) => {
  const dbConn = db()
  const query = `
    SELECT uuid, description, options_json, date
    FROM ${table}
  `
  dbConn.query(query, (e, results) => {
    if (e) return reject('Failed to get charting wma options')

    resolve (results)
  })
  dbConn.end() 
})


exports.getChartingWMAOptionItem = (uuid) => new Promise((resolve, reject) => {
  const query = `
    SELECT uuid, description, options_json, date
    FROM ${table}
    WHERE uuid = ?
  `
  const dbConn = db()
  dbConn.query(query, [uuid], (e, results) => {
    if (e) return reject(`Failed to get charting wma option item: ${e}`)

    resolve(results[0])
  })
  dbConn.end()
})