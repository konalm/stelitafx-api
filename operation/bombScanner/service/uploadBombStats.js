const db = require('@/dbStatistics')
const formatMysqlDate = require('@/services/formatMysqlDate')

module.exports = (stats) => new Promise((_, resolve) => {
  console.log('upload bomb stats')

  const rows  = []
  stats.forEach((x) => {
    rows.push([
      JSON.stringify(x.general), 
      JSON.stringify(x.impulseWave), 
      JSON.stringify(x.retraceWave),
      JSON.stringify(x.continuationWave),
      JSON.stringify(x.trendAlignedWave),
      formatMysqlDate(new Date(x.general.date.start))
    ])
  })

  const conn = db()
  const query = `INSERT INTO bomb (
    general, impulse_wave, retrace_wave, continuation_wave, trend_aligned_wave, bomb_date
  ) VALUES ?`
  conn.query(query, [rows], (e) => {
    if (e) console.error(e)

    resolve()
  })
  
  conn.end()
})