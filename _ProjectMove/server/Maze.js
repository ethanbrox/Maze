var util = require("./Util");
var Chunk = require("./Chunk")

function Maze(rows, cols, chunkSize, cellSize) {
    this.grid = [];
    this.stack = [];
    this.rooms = [];
    this.current;
    this.rows = rows;
    this.cols = cols;
    this.chunkSize = chunkSize;
    this.cellSize = cellSize;
    this.done = false;
    this.change = false;

    /**
     *Creates the entire maze using the grid in the object.
     */
    this.createMaze = function () {
        //fill the grid with blank chunkSize
        for (var j = 0; j < this.rows; j++) {
            for (var i = 0; i < this.cols; i++) {
                var chunk = new Chunk(i, j, this.chunkSize, this.cellSize);

                var color;
                if (this.change) {
                    //color = 'rgb(73, 227, 255)';
                    color = 'cyan';
                    this.change = false;
                } else {
                    //color = 'rgb(178, 178, 178)';
                    color = 'lightgray';
                    this.change = true;
                }

                chunk.color = color;

                chunk.createCells();
                if (chunk) {
                    this.grid.push(chunk);
                }
            }
        }

        this.current = this.grid[0];

        this.createRooms(7, 7);
        this.clearOutRooms();
        this.createDoors();

        while (!this.done) {
            if (this.current) {
                this.current.visited = true;
                //this.current.highlight(context);
                var next = this.current.checkNeighborsNotVisited(this.grid, this.cols, this.rows);
                if (next) {
                    next.visited = true;
                    this.stack.push(this.current);
                    this.removeWalls(this.current, next);
                    this.current = next;
                } else {
                    this.current = this.stack.pop();
                }
            } else {
                //check to make sure the maze is complete
                var check = this.allVisited();
                if (check) {
                    this.current = check;
                } else {
                    if (!this.done) {
                        console.log('Maze Created');
                        this.unMaze();
                        this.done = true;
                    }
                }
            }
        }
    }

    /*
     *Creates the rooms in the grid and adds all new room id's to the rooms array.
     */
    this.createRooms = function (width, height) {
        var tries = 200;
        var count = 0;

        while (count < tries) {
            var placed = false;

            var x = Math.floor(Math.random() * this.cols + 1);
            var y = Math.floor(Math.random() * this.rows + 1);
            if (x + width < this.cols && y + height < this.rows) {
                var valid = true;
                for (var i = -1; i < width + 1; i++) {
                    for (var j = -1; j < height + 1; j++) {
                        if (this.grid[util.index(x + i, y + j, this.cols, this.rows)] && this.grid[util.index(x + i, y + j, this.cols, this.rows)].visited === true) {
                            valid = false;
                        }
                    }
                }

                if (valid) {
                    var id = Math.random();
                    this.rooms.push(id);

                    for (var i = 0; i < width; i++) {
                        for (var j = 0; j < height; j++) {
                            var chunk = this.grid[util.index(x + i, y + j, this.cols, this.rows)];
                            if (chunk) {
                                chunk.visited = true;
                                chunk.roomId = id;
                            }
                        }
                    }
                    placed = true;
                }
            }
            if (!placed) {
                count++;
            }
        }
    }

    /*
     *Clears out all the rooms in the grid array so there are no "walls" inside the rooms.
     */
    this.clearOutRooms = function () {
        for (var i = 0; i < this.grid.length; i++) {
            var r = this.grid[i];
            if (r.visited) {
                var neighbors = r.getNeighbors(this.grid, this.cols, this.rows);
                var top = neighbors[0];
                var right = neighbors[1];
                var bottom = neighbors[2];
                var left = neighbors[3];

                if (r && r.roomId) {
                    this.removeAllCorners(r);
                }

                //remove the walls in between place back corners
                if (top && top.visited && (r.roomId === top.roomId)) {
                    this.removeWalls(r, top);
                } else {
                    this.placeCorners(r, true, false, false, false);
                }

                if (right && right.visited && (r.roomId === right.roomId)) {
                    this.removeWalls(r, right);
                } else {
                    this.placeCorners(r, false, true, false, false);
                }

                if (bottom && bottom.visited && (r.roomId === bottom.roomId)) {
                    this.removeWalls(r, bottom);
                } else {
                    this.placeCorners(r, false, false, true, false);
                }

                if (left && left.visited && (r.roomId === left.roomId)) {
                    this.removeWalls(r, left);
                } else {
                    this.placeCorners(r, false, false, false, true);
                }
            }
        }
    }

    /*
     *Randomly gets rid of a set of walls in each room creating a door to pass through.
     */
    this.createDoors = function () {
        for (var i = 0; i < this.rooms.length; i++) {
            //pick out all squares in that room
            var c = [];
            for (var k = 0; k < this.grid.length; k++) {
                if (this.grid[k].roomId === this.rooms[i]) {
                    c.push(this.grid[k]);
                }
            }
            //get rid of all invalid possibilities
            var r = [];
            for (var k = 0; k < c.length; k++) {
                var hasValidNeighbor = false;
                var neighbors = c[k].getNeighbors(this.grid, this.cols, this.rows);
                for (var l = 0; l < neighbors.length; l++) {
                    if (!neighbors[l].roomId) {
                        hasValidNeighbor = true;
                    }
                }

                if (hasValidNeighbor) {
                    r.push(c[k]);
                }
            }

            //pick a random cell that will work as a valid door
            var rand = Math.floor(Math.random() * r.length);
            var u = r[rand];
            var notOpened = true;
            var neighbors = u.getNeighbors(this.grid, this.cols, this.rows);
            for (var k = 0; k < neighbors.length; k++) {
                if (notOpened && !neighbors[k].roomId) {
                    this.removeWalls(u, neighbors[k]);
                    notOpened = false;
                }
            }
        }
    }

    /*
     *This function goes through the entire maze and does the following:
     *Turns every passage with three walls into a wall, cleaning up the passagways
     *Fills in the wall of the cell that is next two one of the newly created walls
     */
    this.unMaze = function () {
        //Go through all the maze pieces
        var finished = false;
        while (!finished) {
            var found = false;
            for (var i = 0; i < this.cols; i++) {
                for (var j = 0; j < this.rows; j++) {
                    var chunk = this.grid[util.index(i, j, this.cols, this.rows)];
                    if (chunk) {
                        var count = 0;
                        //find out if the given cell can be removed
                        for (var h = 0; h < 4; h++) {
                            if (chunk.walls[h] === true) {
                                count++;
                            }
                        }

                        if (count > 2) {
                            if (count != 4) {
                                found = true;
                            }
                            chunk.walls[0] = true;
                            chunk.walls[1] = true;
                            chunk.walls[2] = true;
                            chunk.walls[3] = true;
                            chunk.color = 'black';
                        }
                    }
                }
            }

            //should have used the neighbors function!!!!!!!
            for (var i = 0; i < this.cols; i++) {
                for (var j = 0; j < this.rows; j++) {
                    var chunk = this.grid[util.index(i, j, this.cols, this.rows)];
                    if (chunk) {
                        var a = this.grid[util.index(i, j - 1, this.cols, this.rows)];
                        var b = this.grid[util.index(i + 1, j, this.cols, this.rows)];
                        var c = this.grid[util.index(i, j + 1, this.cols, this.rows)];
                        var d = this.grid[util.index(i - 1, j, this.cols, this.rows)];

                        if (a) {
                            var count = 0;
                            for (var h = 0; h < 4; h++) {
                                if (a.walls[h] === true) {
                                    count++;
                                }
                            }

                            if (count === 4) {
                                this.placeWalls(chunk, a);
                            }
                        }

                        if (b) {
                            var count = 0;
                            for (var h = 0; h < 4; h++) {
                                if (b.walls[h] === true) {
                                    count++;
                                }
                            }

                            if (count === 4) {
                                this.placeWalls(chunk, b);
                            }
                        }

                        if (c) {
                            var count = 0;
                            for (var h = 0; h < 4; h++) {
                                if (c.walls[h] === true) {
                                    count++;
                                }
                            }

                            if (count === 4) {
                                this.placeWalls(chunk, c);
                            }
                        }

                        if (d) {
                            var count = 0;
                            for (var h = 0; h < 4; h++) {
                                if (d.walls[h] === true) {
                                    count++;
                                }
                            }

                            if (count === 4) {
                                this.placeWalls(chunk, d);
                            }
                        }
                    }
                }
            }

            if (!found) {
                finished = true;
            }
        }
    }

    /*
     *Removes the walls between two chunks
     *@param {Chunk} a
     *@param {Chunk} b
     */
    this.removeWalls = function (a, b) {
        var x = a.i - b.i;
        if (x === 1) {
            a.walls[3] = false;
            b.walls[1] = false;
        } else if (x === -1) {
            a.walls[1] = false;
            b.walls[3] = false;
        }
        var y = a.j - b.j;
        if (y === 1) {
            a.walls[0] = false;
            b.walls[2] = false;
        } else if (y === -1) {
            a.walls[2] = false;
            b.walls[0] = false;
        }
    }

    /*
     *Places walls back between two chunks
     *@param {Chunk} a
     *@param {chunk} b
     */
    this.placeWalls = function (a, b) {
        var x = a.i - b.i;
        if (x === 1) {
            a.walls[3] = true;
            b.walls[1] = true;
        } else if (x === -1) {
            a.walls[1] = true;
            b.walls[3] = true;
        }
        var y = a.j - b.j;
        if (y === 1) {
            a.walls[0] = true;
            b.walls[2] = true;
        } else if (y === -1) {
            a.walls[2] = true;
            b.walls[0] = true;
        }
    }

    /*
     *Turns all Corner cells in a chunk from being a wall to not being a wall
     *@param {Chunk} chunk
     */
    this.removeAllCorners = function (chunk) {
        if (chunk) {
            var corners = chunk.getCorners();
            for (var j = 0; j < corners.length; j++) {
                corners[j].wall = false;
            }
        }
    }

    /*
     *Turns corners into walls in a chunk on the specified side
     *@param {Chunk} chunk
     *@param {boolean} top
     *@param {boolean} right
     *@param {boolean} bottom
     *@param {boolean} left
     */
    this.placeCorners = function (chunk, top, right, bottom, left) {
        if (chunk) {
            var corners = chunk.getCorners();
            if (top) {
                corners[0].wall = true;
                corners[1].wall = true;
            }
            if (right) {
                corners[1].wall = true;
                corners[3].wall = true;
            }
            if (bottom) {
                corners[2].wall = true;
                corners[3].wall = true;
            }
            if (left) {
                corners[0].wall = true;
                corners[2].wall = true;
            }
        }
    }

    /*
     *Checks the grid array to see if every cell has been visited
     *@return {Chunk} the first chunk it finds that is not visited
     *@return {undefined} undefined if every chunk in the array has been visited
     */
    this.allVisited = function () {
        var v = undefined;
        for (var i = 0; i < this.grid.length; i++) {
            if (!this.grid[i].visited) {
                v = this.grid[i];
            }
        }
        return v;
    }
    
    this.update = function(){
        for(var i = 0; i < this.grid.length; i++){
            this.grid[i].update();
        }
    }
    
    this.getChunk = function(x, y){
        for(var i = 0; i < this.grid.length; i++){
            var chunk = this.grid[i];
            var sx = chunk.i * chunk.size;
            var sy = chunk.j * chunk.size;
            var ex = sx + chunk.size;
            var ey = sy + chunk.size;
            
            if(x >= sx && x < ex && y >= sy && y < ey){
                return chunk;
            }
        }
        return chunk;
    }
}
module.exports = Maze;
