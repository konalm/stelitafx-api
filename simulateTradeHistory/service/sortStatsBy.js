module.exports = (stats, sortBy, dir) => {
  const s = [...stats]

  switch (sortBy) {
    case 'best':
      return s.sort((a, b) => b.pipsPerTrade - a.pipsPerTrade)
    case 'worst':
      return s.sort((a, b) => a.pipsPerTrade - b.pipsPerTrade)
    case 'winPer':
      return s.sort((a, b) => b.winPercentage - a.winPercentage)
    case 'pipsPerDay':
      return s.sort((a, b) => b.pipsPerDay - a.pipsPerDay)
    case 'worstPipsPerDay':
      return s.sort((a, b) => a.pipsPerDay - b.pipsPerDay)
    case 'netPipsPerDay':
      return s.sort((a, b) => b.netPipsPerDay - a.netPipsPerDay)
    case 'shortNetPipsPerDay':
      return s.sort((a, b) => a.shortNetPipsPerDay - b.shortNetPipsPerDay)
    default:
      if (!sortBy) return s

      return s.sort((a, b) => {
        if (dir === 'desc') return b[sortBy] - a[sortBy]
        return a[sortBy] - b[sortBy]
      })
  }
}