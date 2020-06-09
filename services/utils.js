const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

exports.getDate = date => date instanceof Date 
  ? new Date(date.getTime())
  : new Date(date)

exports.dateTs = date => {
  const d = this.getDate(date)

  return d.getTime() / 1000
}

exports.minsAgo = date => mins => {
  const d = this.getDate(date)
  d.setMinutes(d.getMinutes() - mins)

  return d
}

exports.minsAhead = date => mins => {
  const d = this.getDate(date)
  d.setMinutes(d.getMinutes() + mins)

  return d
}

exports.minsAgoTs = date => mins => this.dateTs(this.minsAgo(date)(mins))

exports.minsAheadTs = date => mins => this.dateTs(this.minsAhead(date)(mins))

exports.daysBetweenDates = dateA => dateB => {
  const dA = this.getDate(dateA)
  const dB = this.getDate(dateB)
  const secDiff = Math.abs(dA - dB) / 1000;

  return Math.floor(secDiff / 86400);
}

exports.percentage = (gained, lost) => {
  const wholeNumber = gained + lost;
  const division = gained / wholeNumber

  return division * 100;
}

exports.percentageOf = (total, obtained) => (obtained / total) * 100

exports.dateStripMins = (date) => {
  // console.log('date strip mins')

  const d = this.getDate(date)
  d.setMinutes(0)
  
  return d
}

exports.dateStripSecs = (date) => {
  // console.log('date strip secs')
  // console.log(typeof(date))

  const d = this.getDate(date)

  // console.log(`date strip secs -->`)
  // console.log(d)

  d.setSeconds(0)

  // console.log('date after setting seconds -->')
  // console.log(d)

  return d
}

exports.dateCorrectGmt = (date) => {
  // console.log('date correct GMT')
  // console.log(date)
  // console.log(typeof(date))

  return date instanceof Date 
    ? date.toISOString().replace("Z", "")
    : date.replace("Z")
}


exports.dateMinusHours = (date, hours) => {
  const d = this.getDate(date)
  d.setHours(d.getHours() - hours)

  return d
}

exports.dateAddHours = (date, hours) => {
  const d = this.getDate(date)
  d.setHours(d.getHours() + hours)

  return d
}