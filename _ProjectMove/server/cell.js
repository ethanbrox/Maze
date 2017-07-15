var cell = function (x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.color = 'white';
    this.id = null;
    this.collision = 0;
};

module.exports = cell;
