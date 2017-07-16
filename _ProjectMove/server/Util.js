/**
 *Creates the index in a 1d array given the coordinate in 2d space.
 *@param {Number} i
 *@param {Number} j
 *@return {Number} Index given i and j
 *@return {error} -1 if it is out of bounds of the grid
 */
var index = function (i, j, cols, rows) {
    if (cols) {
        if (!rows) {
            rows = cols;
        }
    } else {
        return -1;
    }

    if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
        return -1;
    }
    return i + j * cols;
}

module.exports.index = index;
