module.exports = (waves) => {
  const wavePairs = []
  waves.forEach((wave, i) => {
    if (i % 2) wavePairs.push({ first: waves[i - 1] , second: wave})
  })

  return wavePairs
}
