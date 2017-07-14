var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;

var rows = 27;
var cols = 27;
var chunkSize = 5; // greater than or equal to 3
var cellSize = 5; //this is in pixels

var grid = [];
var stack = [];
var rooms = [];

var lines = false;
var done = false;
var current;
var change = false;

window.onload = function(){
  //fill the grid with blank chunkSize
  for(var j = 0; j < rows; j++){
    for(var i = 0; i < cols; i++){
      var chunk = new Chunk(i, j, chunkSize);
      /*var r = Math.floor(Math.random()*256);
      var g = Math.floor(Math.random()*256);
      var b = Math.floor(Math.random()*256);
      var color = 'rgb(' + r + ',' + g + ',' + b + ')';*/
      var color;
      if(change){
        //color = 'rgb(73, 227, 255)';
        color='cyan';
        change = false;
      } else {
        //color = 'rgb(178, 178, 178)';
        color = 'lightgray';
        change = true;
      }

      chunk.color = color;

      chunk.createCells();
      if(chunk){
        grid.push(chunk);
      }
    }
  }

  current = grid[0];


  var draw = function(){
    context.clearRect(0, 0, width, height);
    for(var i = 0; i < grid.length; i++){
      grid[i].show(context);
    }

    if(current){
        current.visited = true;
        current.highlight(context);
        var next = current.checkNeighborsNotVisited();
        if(next){
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else {
            current = stack.pop();
        }
    } else {
      //check to make sure the maze is complete
      var check = allVisited();
      if(check){
        current = check;
      } else {
        if(!done){
          //alert("done:)");
          unMaze();
          done = true;
        }
      }
    }

    window.requestAnimationFrame(draw);
  }

  createRooms();
  clearOutRooms();
  createDoors();
  draw();
}

function chunkIndex(i, j){
    if(i < 0 || j < 0 || i > cols-1 || j > rows-1){
        return -1;
    }
    return i+j*cols;
}

function cellIndex(i, j){
    if(i < 0 || j < 0 || i > chunkSize-1 || j > chunkSize-1){
        return -1;
    }
    return i+j*chunkSize;
}

function createRooms(){
  var tries = 300;
  var count = 0;

  while(count < tries){
    var placed = false;

    var x = Math.floor(Math.random() * cols + 1);
    var y = Math.floor(Math.random() * rows + 1);
    var width = 3;
    var height = 4;

    if(x + width < cols && y + height < rows){
      var valid = true;
      for(var i = -1; i < width + 1; i++){
        for(var j = -1; j < height + 1; j++){
          if(grid[chunkIndex(x + i, y + j)] && grid[chunkIndex(x + i, y + j)].visited === true){
            valid = false;
          }
        }
      }

      if(valid){
        var id = Math.random();
        rooms.push(id);

        for(var i = 0; i < width; i++){
          for(var j = 0; j < height; j++){
            var chunk = grid[chunkIndex(x + i, y + j)];
            chunk.visited = true;
            chunk.roomId = id;
            //chunk.color = 'blue';
          }
        }
        placed = true;
      }
    }
    if(!placed){
      count++;
    }
  }
}

function clearOutRooms(){
    for(var i = 0; i < grid.length; i++){
        var r = grid[i];
        if(r.visited){
            var neighbors = r.getNeighbors();
            var top = neighbors[0];
            var right = neighbors[1];
            var bottom = neighbors[2];
            var left = neighbors[3];

            if(r && r.roomId){
              removeAllCorners(r);
            }

            //remove the walls in between place back corners
            if(top && top.visited && (r.roomId === top.roomId)){
                removeWalls(r, top);
            } else {
              placeCorners(r, true, false, false, false);
            }

            if(right && right.visited && (r.roomId === right.roomId)){
                removeWalls(r, right);
            } else {
              placeCorners(r, false, true, false, false);
            }

            if(bottom && bottom.visited && (r.roomId === bottom.roomId)){
                removeWalls(r, bottom);
            } else {
              placeCorners(r, false, false, true, false);
            }

            if(left && left.visited && (r.roomId === left.roomId)){
                removeWalls(r, left);
            } else {
              placeCorners(r, false, false, false, true);
            }
        }
    }
}

function createDoors(){
    for(var i = 0; i < rooms.length; i++){
        //pick out all squares in that room
        var c = [];
        for(var k = 0; k < grid.length; k++){
            if(grid[k].roomId === rooms[i]){
                c.push(grid[k]);
            }
        }
        //get rid of all invalid possibilities
        var r = [];
        for(var k = 0; k < c.length; k++){
            var hasValidNeighbor = false;
            var neighbors = c[k].getNeighbors();
            for(var l = 0; l < neighbors.length; l++){
                if(!neighbors[l].roomId){
                    hasValidNeighbor = true;
                }
            }

            if(hasValidNeighbor){
                r.push(c[k]);
            }
        }

        //pick a random cell that will work as a valid door
        var rand = Math.floor(Math.random() * r.length);
        var u = r[rand];
        var notOpened = true;
        var neighbors = u.getNeighbors();
        for(var k = 0; k < neighbors.length; k++){
            if(notOpened && !neighbors[k].roomId){
                removeWalls(u, neighbors[k]);
                notOpened = false;
            }
        }
    }
}

function unMaze(){
  //Go through all the maze pieces
  var finished = false;
  var numPasses = 0;
  while(!finished && numPasses < 100){
    var found = false;
    for(var i = 0; i < cols; i++){
      for(var j = 0; j < rows; j++){
        var chunk = grid[chunkIndex(i, j)];
        if(chunk){
          var count = 0;
          //find out if the given cell can be removed
          for(var h = 0; h < 4; h++){
            if(chunk.walls[h] === true){
              count++;
            }
          }

          if(count > 2){
            if(count != 4){
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
    for(var i = 0; i < cols; i++){
      for(var j = 0; j < rows; j++){
        var chunk = grid[chunkIndex(i, j)];
        if(chunk){
          var a = grid[chunkIndex(i, j - 1)];
          var b = grid[chunkIndex(i + 1, j)];
          var c = grid[chunkIndex(i, j + 1)];
          var d = grid[chunkIndex(i - 1, j)];

          if(a){
            var count = 0;
            for(var h = 0; h < 4; h++){
              if(a.walls[h] === true){
                count++;
              }
            }

            if(count === 4){
              placeWalls(chunk, a);
            }
          }

          if(b){
            var count = 0;
            for(var h = 0; h < 4; h++){
              if(b.walls[h] === true){
                count++;
              }
            }

            if(count === 4){
              placeWalls(chunk, b);
            }
          }

          if(c){
            var count = 0;
            for(var h = 0; h < 4; h++){
              if(c.walls[h] === true){
                count++;
              }
            }

            if(count === 4){
              placeWalls(chunk, c);
            }
          }

          if(d){
            var count = 0;
            for(var h = 0; h < 4; h++){
              if(d.walls[h] === true){
                count++;
              }
            }

            if(count === 4){
              placeWalls(chunk, d);
            }
          }
        }
      }
    }

    if(!found){
      finished = true;
    }
    //numPasses++;
  }
}

function removeWalls(a, b){
    var x = a.i - b.i;
    if(x === 1){
        a.walls[3] = false;
        b.walls[1] = false;
    } else if (x === -1){
        a.walls[1] = false;
        b.walls[3] = false;
    }
    var y = a.j - b.j;
    if(y === 1){
        a.walls[0] = false;
        b.walls[2] = false;
    } else if(y === -1){
        a.walls[2] = false;
        b.walls[0] = false;
    }
}

placeWalls = function(a, b){
  var x = a.i - b.i;
  if(x === 1){
      a.walls[3] = true;
      b.walls[1] = true;
  } else if (x === -1){
      a.walls[1] = true;
      b.walls[3] = true;
  }
  var y = a.j - b.j;
  if(y === 1){
      a.walls[0] = true;
      b.walls[2] = true;
  } else if(y === -1){
      a.walls[2] = true;
      b.walls[0] = true;
  }
}

removeAllCorners = function(chunk){
  if(chunk){
    var corners = chunk.getCorners();
    for(var j = 0; j < corners.length; j++){
      corners[j].wall = false;
    }
  }
}

placeCorners = function(chunk, top, right, bottom, left){
  if(chunk){
    var corners = chunk.getCorners();
    if(top){
      corners[0].wall = true;
      corners[1].wall = true;
    }
    if(right){
      corners[1].wall = true;
      corners[3].wall = true;
    }
    if(bottom){
      corners[2].wall = true;
      corners[3].wall = true;
    }
    if(left){
      corners[0].wall = true;
      corners[2].wall = true;
    }
  }
}

function allVisited(){
  var v = undefined;
  for(var i = 0; i < grid.length; i++){
    if(!grid[i].visited){
      v = grid[i];
    }
  }
  return v;
}
