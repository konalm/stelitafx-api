module.exports = (waves) => {
  console.log('construct waves service')
  console.log(waves.length)

  const wavePairs = []
  waves.forEach((wave, i) => {
    if (i % 2) wavePairs.push({ first: waves[i - 1] , second: wave})
  })

  return wavePairs
}
