const chalk = require('chalk')

module.exports = (message, type) => {
  const typeColour = {
    info: 'cyan',
    danger: 'red',
    warning: 'yellow',
    success: 'green'
  }
  const colour = typeColour[type]

  console.log(chalk[colour](message))
}