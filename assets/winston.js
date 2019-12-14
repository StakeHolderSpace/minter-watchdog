const winston = require('winston')
var stringify = require('json-stringify-safe');
const path = require('path')
const ENV = process.env.NODE_ENV


const logFormat = winston.format.printf(function (info) {
  let date = new Date().toISOString()
  return `${date}-${info.level}: ${stringify(info.message, null, 2)}`

})

module.exports = winston.createLogger({
  transports : [
    new winston.transports.Console({
      level : ENV === 'development' ? 'debug' : 'info',
      //prettyPrint: true,
      label : '',
      format: winston.format.combine(winston.format.colorize(), logFormat)
    })
  ],
  exitOnError: false
})
