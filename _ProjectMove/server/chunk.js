var Cell = require("./cell");

var chunk = function (i, j, n, cellSize, chunkSize, cols, rows) {
    this.i = i;
    this.j = j;
    this.n = n;
    this.cellSize = cellSize;
    this.chunkSize = chunkSize;
    this.cells = [];
    this.cols = cols;
    this.rows = rows;
    this.roomId = undefined;
    this.size = n * this.cellSize; //in pixels
    this.wallSize = n - 2;
    this.color = 'white';
    this.visited = false;
    this.walls = [true, true, true, true]; //top right bottom left
    this.top = [];
    this.right = [];
    this.bottom = [];
    this.left = [];

    this.createCells = function () {
        for (var j = 0; j < this.n; j++) {
            for (var i = 0; i < this.n; i++) {
                var x = (this.i * this.size) + (i * this.cellSize);
                var y = (this.j * this.size) + (j * this.cellSize);
                var cell = new Cell(x, y, this.cellSize);
                cell.color = this.color;
                if (i === 0 || j === 0 || i === this.n - 1 || j === this.n - 1) {
                    cell.wall = true;
                }
                this.cells.push(cell);
            }
        }

        for (var j = 0; j < this.n; j++) {
            for (var i = 0; i < this.n; i++) {

                if (j === 0) {
                    if (i != 0) {
                        if (i != this.n - 1) {
                            this.top.push(this.cells[this.cellIndex(i, j)]);
                        }
                    }
                }

                if (i === this.n - 1) {
                    if (j != 0) {
                        if (j != this.n - 1) {
                            this.right.push(this.cells[this.cellIndex(i, j)]);
                        }
                    }
                }

                if (j === this.n - 1) {
                    if (i != 0) {
                        if (i != this.n - 1) {
                            this.bottom.push(this.cells[this.cellIndex(i, j)]);
                        }
                    }
                }

                if (i === 0) {
                    if (j != 0) {
                        if (j != this.n - 1) {
                            this.left.push(this.cells[this.cellIndex(i, j)]);
                        }
                    }
                }
            }
        }
    }

    this.checkNeighborsNotVisited = function () {
        var temp = this.getNeighbors();
        var neighbors = [];

        for (var i = 0; i < temp.length; i++) {
            if (!temp[i].visited) {
                neighbors.push(temp[i]);
            }
        }

        if (neighbors.length > 0) {
            var r = Math.floor(Math.random() * neighbors.length);
            return neighbors[r];
        } else {
            return undefined;
        }
    }

    this.getNeighbors = function (grid) {
        var neighbors = [];

        var top = grid[this.chunkIndex(i, j - 1)];
        var right = grid[this.chunkIndex(i + 1, j)];
        var bottom = grid[this.chunkIndex(i, j + 1)];
        var left = grid[this.chunkIndex(i - 1, j)];

        if (top) {
            neighbors.push(top);
        }
        if (right) {
            neighbors.push(right);
        }
        if (bottom) {
            neighbors.push(bottom);
        }
        if (left) {
            neighbors.push(left);
        }

        return neighbors;
    }

    this.getCorners = function () {
        var corners = [];

        corners.push(this.cells[0]);
        corners.push(this.cells[this.cellIndex(this.chunkSize - 1, 0)]);
        corners.push(this.cells[this.cellIndex(0, this.chunkSize - 1)]);
        corners.push(this.cells[this.cells.length - 1]);

        return corners;
    }
    
    /**
     *Creates the index in a 1d array given the coordinate in 2d space of a Chunk.
     *@param {Number} i
     *@param {Number} j
     *@return {Number} Index given i and j
     *@return {error} -1 if it is out of bounds of the grid
     */
    this.chunkIndex = function (i, j) {
        if (this.i < 0 || this.j < 0 || this.i > this.cols - 1 || this.j > this.rows - 1) {
            return -1;
        }
        return this.i + this.j * this.cols;
    }

    /**
     *Creates the index in a 1d array given the coordinate in 2d space of a cell.
     *@param {Number} i
     *@param {Number} j
     *@return {Number} Index given i and j
     *@return {error} -1 if it is out of bounds of the grid
     */
    this.cellIndex = function (i, j) {
        if (this.i < 0 || this.j < 0 || this.i > this.chunkSize - 1 || this.j > this.chunkSize - 1) {
            return -1;
        }
        return this.i + this.j * this.chunkSize;
    }
};

module.exports = chunk;
