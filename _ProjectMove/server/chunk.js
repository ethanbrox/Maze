var Cell = require("./Cell");
var util = require("./Util");

var Chunk = function (i, j, n, cellSize) {
    this.i = i;
    this.j = j;
    this.n = n;
    this.cellSize = cellSize;
    this.cells = [];
    this.roomId = undefined;
    this.size = n * cellSize; //in pixels
    this.wallSize = n - 2;
    this.color = 'white';
    this.visited = false;
    //top right bottom left
    this.walls = [true, true, true, true];
    this.top = [];
    this.right = [];
    this.bottom = [];
    this.left = [];

    this.createCells = function () {
        for (var j = 0; j < this.n; j++) {
            for (var i = 0; i < this.n; i++) {
                var x = (this.i * this.size) + (i * this.cellSize);
                var y = (this.j * this.size) + (j * this.cellSize);
                var cell = new Cell(i, j, x, y, this.cellSize);
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
                            this.top.push(this.cells[util.index(i, j, this.n)]);
                        }
                    }
                }

                if (i === this.n - 1) {
                    if (j != 0) {
                        if (j != this.n - 1) {
                            this.right.push(this.cells[util.index(i, j, this.n)]);
                        }
                    }
                }

                if (j === this.n - 1) {
                    if (i != 0) {
                        if (i != this.n - 1) {
                            this.bottom.push(this.cells[util.index(i, j, this.n)]);
                        }
                    }
                }

                if (i === 0) {
                    if (j != 0) {
                        if (j != this.n - 1) {
                            this.left.push(this.cells[util.index(i, j, this.n)]);
                        }
                    }
                }
            }
        }
    }

    this.update = function () {
        for (var i = 0; i < this.top.length; i++) {
            this.top[i].wall = this.walls[0];
        }
        for (var i = 0; i < this.right.length; i++) {
            this.right[i].wall = this.walls[1];
        }
        for (var i = 0; i < this.bottom.length; i++) {
            this.bottom[i].wall = this.walls[2];
        }
        for (var i = 0; i < this.left.length; i++) {
            this.left[i].wall = this.walls[3];
        }
    }

    this.checkNeighborsNotVisited = function (grid, cols, rows) {
        var temp = this.getNeighbors(grid, cols, rows);
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

    this.getNeighbors = function (grid, cols, rows) {
        var neighbors = [];

        var top = grid[util.index(i, j - 1, cols, rows)];
        var right = grid[util.index(i + 1, j, cols, rows)];
        var bottom = grid[util.index(i, j + 1, cols, rows)];
        var left = grid[util.index(i - 1, j, cols, rows)];

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
        corners.push(this.cells[util.index(this.n - 1, 0, this.n)]);
        corners.push(this.cells[util.index(0, this.n - 1, this.n)]);
        corners.push(this.cells[this.cells.length - 1]);

        return corners;
    }
    
    this.getCell = function(x, y){
        for(var i = 0; i < this.cells.length; i++){
            var cell = this.cells[i];
            var sx = cell.x;
            var sy = cell.y;
            var ex = sx + cell.w;
            var ey = sy + cell.w;
            
            if(x >= sx && x < ex && y >= sy && y < ey){
                return cell;
            }
        }
        return cell;
    }

    this.getInfo = function () {
        var chunks = [];
        for (var i = 0; i < this.cells.length; i++) {
            chunks.push(this.cells[i].getInfo());
        }
        return chunks;
    }
}

module.exports = Chunk;
