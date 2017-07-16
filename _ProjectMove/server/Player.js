var Chunk = require("./Chunk");
var Cell = require("./Cell");

var Player = function (socket, id) {
    this.socket = socket;
    this.id = id;
    this.health = 100;
    this.x = 525;
    this.y = 525;
    this.roomId = null;
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.speed = 10;
    this.radius = 50;

    this.updatePosition = function (maze) {
        var chunk = maze.getChunk(this.x, this.y);
        var cell = chunk.getCell(this.x, this.y);
        cell.color = 'purple';
        var neighbors = cell.getNeighbors(chunk.cells, chunk.n, chunk.n);

        if (this.pressingUp) {
            var n = neighbors[0];
            if (n && n.wall) {
                if (!this.colission(n.x, n.y, n.w, n.w)) {
                    this.y -= this.speed;
                }
            } else {
                this.y -= this.speed;
            }
        }

        if (this.pressingRight) {
            var n = neighbors[1];
            if (n && n.wall) {
                if (!this.colission(n.x, n.y, n.w, n.w)) {
                    this.x += this.speed;
                }
            } else {
                this.x += this.speed;
            }
        }

        if (this.pressingDown) {
            var n = neighbors[2];
            if (n && n.wall) {
                if (!this.colission(n.x, n.y, n.w, n.w)) {
                    this.y += this.speed;
                }
            } else {
                this.y += this.speed;
            }
        }

        if (this.pressingLeft) {
            var n = neighbors[3];
            if (n && n.wall) {
                if (!this.colission(n.x, n.y, n.w, n.w)) {
                    this.x -= this.speed;
                }
            } else {
                this.x -= this.speed;
            }
        }
    }

    this.getData = function () {
        var r = {
            id: this.id,
            x: this.x,
            y: this.y,
            radius: this.radius,
            color: this.color,
            health: this.health,
        };
        return r;
    }

    this.colission = function (rectX, rectY, rectWidth, rectHeight) {
        var deltaX = this.x - Math.max(rectX, Math.min(this.x, rectX + rectWidth));
        var deltaY = this.y - Math.max(rectY, Math.min(this.y, rectY + rectHeight));
        return (deltaX * deltaX + deltaY * deltaY) < (this.radius * this.radius);
    }
}

module.exports = Player;
