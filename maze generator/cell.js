function Cell(x, y, w){
  this.x = x;
  this.y = y;
  this.w = w;
  this.color = 'white';
  this.id = null;
  this.wall = false;

  this.show = function(context){
    context.fillStyle = this.color;
    if(this.wall){
      context.fillStyle = 'black';
    }
    context.fillRect(this.x, this.y, this.w, this.w);

    if(lines){
      context.strokeStyle = 'white';
      context.strokeWidth = 1;
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.lineTo(this.x+this.w, this.y);
      context.stroke();

      context.beginPath();
      context.moveTo(this.x+this.w, this.y);
      context.lineTo(this.x+this.w, this.y+this.w);
      context.stroke();

      context.beginPath();
      context.moveTo(this.x+this.w, this.y+this.w);
      context.lineTo(this.x, this.y+this.w);
      context.stroke();

      context.beginPath();
      context.moveTo(this.x, this.y+this.w);
      context.lineTo(this.x, this.y);
      context.stroke();
    }
  }
}
