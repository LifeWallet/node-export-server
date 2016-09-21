/*

Highcharts Export Server

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

const fs = require('fs');
const mkdirp = require('mkdirp');
const logLevels = [
            {title: 'error', color: 'red'},
            {title: 'warning', color: 'yellow'},
            {title: 'notice', color: 'blue'},
            {title: 'verbose', color: 'gray'}
        ]
;

var logLevel = 4,
    logPath = __dirname + '/../logs/',
    logName = 'higcharts-export-server',
    logToFile = false,
    logToConsole = true
;

/** Logger module
 *  @module logger
 */
module.exports = {

    /** Enable or disable logging to stdout
     *  @export logger
     *  @param enabled {boolean} - state
     */
    toggleSTDOut: function (enabled) {
        logToConsole = enabled;
    },

    /** Set the file logging configuration
     *  @export logger
     *  @param path {string} - path to log to
     *  @param name {string} - the name of the log file
     */
    enableFileLogging: function (path, name) {
        logPath = logPath || path;
        logName = name || logName;

        logToFile = false;

        if (logPath.length === 0) {
            return module.exports.log(0, 'logger file logging init: no path supplied');
        }

        if (logPath[logPath.length - 1] !== '/') {
            logPath += '/';
        }

        //Create the folder if it doesn't exist
        mkdirp(logPath, function (err) {
            if (err) return module.exports.log(0, 'error creating log path:', err);
            logToFile = true;
        });
    },

    /** Set the current log level
     *  Log levels are: 
     *    - 0 = no logging
     *    - 1 = error  
     *    - 2 = warning 
     *    - 3 = notice
     *    - 4 = verbose
     *  @export logger
     *  @param newLevel {number} - the new log level (0..4)
     */
    setLogLevel: function (newLevel) {
        if (newLevel >= 0 && newLevel <= logLevels.length) {
            logLevels = newLevel;
        }
    },

    /** Log a message
     *  Accepts a variable amount of arguments.
     *  Arguments after `level` will be passed directly to console.log,
     *  and/or will be joined and appended to the log file.
     *  @export logger
     *  @param level {number} - the log level
     */  
    log: function (level) {
        var things = (Array.prototype.slice.call(arguments));
        things.splice(0, 1);

        if (logLevel > logLevels.length) {
            return;
        }

        if (level === 0 || level > logLevel + 1) {
            return;
        }

        level--;

        if (logToFile) {
            fs.appendFile(
                logPath + logName + '.txt', 
                [logLevels[level].title].concat(things).join(),
                function (err) {
                    module.exports.log(1, 'unable to write to log file:', err);
                    logToFile = false;
                }
            );
        }

        if (logToConsole) {
            console.log.apply(
                undefined, 
                [('[' + logLevels[level].title + ']')[logLevels[level].color]]
                .concat(things)
            );            
        }
    }
};