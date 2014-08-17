/* =========================================================================
 *
 *  symbols
 *      Defines special symbols used by logger
 *
 * ========================================================================= */
var STYLES = require('./styles');

module.exports = {
    success: STYLES.colors.green + '✔︎ ' + STYLES.colors.reset,
    error: STYLES.colors.red + '✘ ' + STYLES.colors.reset,
    arrow: '➤ ',
    star: '☆ ',
    box: STYLES.colors.yellow + '☐ ' + STYLES.colors.reset,
    boxSuccess: STYLES.colors.green + '☑︎ ' + STYLES.colors.reset,
    boxError: STYLES.colors.red + '☒ ' + STYLES.colors.reset,
    circle: '◯ ',
    circleFilled: '◉ ',
    asertik: '✢',
    floral: '❧',
    snowflake: '❄︎',
    fourDiamond:'❖',
    spade: '♠︎',
    club: '♣︎',
    heart: '♥︎',
    diamond: '♦︎',
    queen: '♛',
    rook: '♜',
    pawn: '♟',
    atom: '⚛'
};
