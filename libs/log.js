/**
 * Created with IntelliJ IDEA.
 * User: a.krasovsky
 * Date: 05.03.14
 * Time: 19:05
 * To change this template use File | Settings | File Templates.
 */
var winston = require('winston');

function getLogger(module) {
    var path = module.filename.split('/').slice(-2).join('/'); //отобразим метку с именем файла, который выводит сообщение

    return new winston.Logger({
        transports : [
            new winston.transports.Console({
                colorize:   true,
                level:      'debug',
                label:      path
            })
        ]
    });
}

module.exports = getLogger;