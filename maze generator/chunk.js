function Chunk(i, j, n){
  this.i = i;
  this.j = j;
  this.n = n;
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

  this.createCells = function(){
    for(var j = 0; j < this.n; j++){
      for(var i = 0; i < this.n; i++){
        var x = (this.i * this.size) + (i * cellSize);
        var y = (this.j * this.size) + (j * cellSize);
        var cell = new Cell(x, y, cellSize);
        cell.color = this.color;
        if(i === 0 || j === 0 || i === this.n - 1 || j === this.n - 1){
          cell.wall = true;
        }
        this.cells.push(cell);
      }
    }

    for(var j = 0; j < this.n; j++){
      for(var i = 0; i < this.n; i++){

        if(j === 0){
          if(i != 0){
            if(i != this.n - 1){
              this.top.push(this.cells[cellIndex(i, j)]);
            }
          }
        }

        if(i === this.n - 1){
          if(j != 0){
            if(j != this.n - 1){
              this.right.push(this.cells[cellIndex(i, j)]);
            }
          }
        }

        if(j === this.n - 1){
          if(i != 0){
            if(i != this.n - 1){
              this.bottom.push(this.cells[cellIndex(i, j)]);
            }
          }
        }

        if(i === 0){
          if(j != 0){
            if(j != this.n - 1){
              this.left.push(this.cells[cellIndex(i, j)]);
            }
          }
        }
      }
    }
  }

  this.show = function(context){
    for(var i = 0; i < this.cells.length; i++){
      this.cells[i].color = this.color;
      this.cells[i].show(context);
    }

    for(var i = 0; i < this.top.length; i++){
      this.top[i].wall = this.walls[0];
    }
    for(var i = 0; i < this.right.length; i++){
      this.right[i].wall = this.walls[1];
    }
    for(var i = 0; i < this.bottom.length; i++){
      this.bottom[i].wall = this.walls[2];
    }
    for(var i = 0; i < this.left.length; i++){
      this.left[i].wall = this.walls[3];
    }
  }

  this.checkNeighborsNotVisited = function(){
      var temp = this.getNeighbors();
      var neighbors = [];

      for(var i = 0; i < temp.length; i++){
          if(!temp[i].visited){
              neighbors.push(temp[i]);
          }
      }

      if(neighbors.length > 0){
          var r = Math.floor(Math.random() * neighbors.length);
          return neighbors[r];
      } else{
           return undefined;
      }
  }

  this.getNeighbors = function(){
      var neighbors = [];

      var top = grid[chunkIndex(i, j - 1)];
      var right = grid[chunkIndex(i+1, j)];
      var bottom = grid[chunkIndex(i, j+1)];
      var left = grid[chunkIndex(i-1, j)];

      if(top){
          neighbors.push(top);
      }
      if(right){
          neighbors.push(right);
      }
      if(bottom){
          neighbors.push(bottom);
      }
      if(left){
          neighbors.push(left);
      }

      return neighbors;
  }

  this.getCorners = function(){
    var corners = [];

    corners.push(this.cells[0]);
    corners.push(this.cells[cellIndex(chunkSize - 1, 0)]);
    corners.push(this.cells[cellIndex(0, chunkSize - 1)]);
    corners.push(this.cells[this.cells.length - 1]);

    return corners;
  }

  this.highlight = function(context, h){
      var x = this.i * this.size;
      var y = this.j * this.size;
      if(h){
          context.fillStyle = h;
      } else {
          context.fillStyle = 'rgba(0, 0, 255, .8)';
      }
      context.fillRect(x, y, this.size, this.size);
  }
}
