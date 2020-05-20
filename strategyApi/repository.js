const db = require('@/dbInstance')


exports.list = () => new Promise((resolve, reject) => {
  const conn = db()
  const query = 'SELECT UUID, name, description FROM strategy'

  conn.query(query, (e, results) => {
    conn.end()

    if (e) return reject(e)
    resolve (results)
  })
})


exports.get = (uuid) => new Promise((resolve, reject) => {
  const conn = db()
  const query = `
    SELECT s.UUID, 
      s.name, 
      s.description, 
      GROUP_CONCAT ( 
        CONCAT_WS(',', ma.UUID, ma.description)
        SEPARATOR ';'
      ) AS masterAlgos
    FROM strategy s
    LEFT JOIN master_algorithm ma
      ON ma.strategy_UUID = s.UUID
    WHERE s.UUID = ?
    GROUP BY s.UUID, s.name, s.description
  `
  const queryValues = [uuid]

  conn.query(query, queryValues, (e, results) => {
    conn.end()

    if (e) return reject(e)

    const r = [...results].map((row) => {
      const masterAlgos = row.masterAlgos
        .split(";")
        .map((x) => {
          const cols = x.split(',')
          return { UUID: cols[0], description: cols[1] }
        })

      return {
        UUID: row.UUID,
        name: row.name,
        description: row.description,
        masterAlgos
      }
    })
    
    resolve(r[0])
  })
})


exports.getMasterAlgorithm = (strategyUuid, masterAlgoUuid) => 
  new Promise((resolve, reject) => 
{
  const conn = db()
  const query = `
    SELECT ma.UUID, 
      ma.description, 
      ma.strategy_UUID, 
      ma.no,
      GROUP_CONCAT ( a.id ) algorithm_ids
    FROM master_algorithm ma
    LEFT JOIN algorithm a
      ON a.master_algorithm = ma.UUID
    WHERE strategy_UUID = ?
      AND UUID = ?
    GROUP BY ma.UUID, ma.description, ma.strategy_UUID, ma.no

  `
  const queryValues = [strategyUuid, masterAlgoUuid]

  conn.query(query, queryValues, (e, results) => {
    conn.end()

   const r = results.map((row) => ({
     UUID: row.UUID,
     description: row.description,
     strategyUUID: row.strtategy_UUID,
     no: row.no,
     algorithmIds: row.algorithm_ids.split(",").map((x) => parseInt(x))
   }))[0]

    if (e) return reject(e)
    resolve(r)
  })
})