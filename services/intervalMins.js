const intervalMins = (interval) => {
  const intervalMins = []
  for (let i = 0; i < 60; i++) {
    if (i % interval === 0) intervalMins.push(i)
  }

  return intervalMins;
} 

module.exports = intervalMins