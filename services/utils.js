const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

exports.getDate = date =>  date instanceof Date 
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
