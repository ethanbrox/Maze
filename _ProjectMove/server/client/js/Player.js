var Player = {
  id: null,
  x: 50,
  y: 50,
  color: 'black',
  health: 100,

  create: function() {
    var obj = Object.create(this);
    return obj;
  },

  draw: function(ctx) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, 25, 0, 2 * Math.PI, false);
    ctx.fill();
  }
};
