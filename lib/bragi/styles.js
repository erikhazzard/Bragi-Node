/* =========================================================================
 *
 *  styles
 *      Defines styles / colors for logger
 *
 * ========================================================================= */
module.exports = {
    colors: {
        white: '\x1B[37m',
        grey: '\x1B[90m',
        gray: '\x1B[90m',
        black: '\x1B[30m',
        blue: '\x1B[34m',
        cyan: '\x1B[36m',
        green: '\x1B[32m',
        magenta: '\x1B[35m',
        red: '\x1B[31m',
        yellow: '\x1B[33m',
        reset: '\033[0m'
    },
    styles: {
        blink: '\x1B[49;5;8m',
        underline: '\x1B[4m', 
        bold: '\x1B[1m'
    },
    backgrounds: {
        white: '\x1B[47m',
        black: '\x1B[40m',
        blue: '\x1B[44m',
        cyan: '\x1B[46m',
        green: '\x1B[42m',
        magenta: '\x1B[45m',
        red: '\x1B[41m',
        yellow: '\x1B[43m'
    }
};
