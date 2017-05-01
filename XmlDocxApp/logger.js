var winston = require('winston');
winston.configure({
    transports: [
     new (winston.transports.Console)({
         timestamp: true,
         json: false,
         colorize: true
     })
    ]
});

module.exports = winston;