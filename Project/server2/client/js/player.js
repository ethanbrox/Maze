var player = {
	id: null,
	health: 100,
	x: 50,
	y: 50,
	
	create: function(id){
		var obj = Object.create(this);
		this.id = id;
		return obj;
	},
	
	draw: function(context){
		context.beginPath();
		context.arc(this.x, this.y,25, 0, 2 * Math.PI, false);
		context.fillStyle = this.color;
		context.fill();
		context.lineWidth = 5;
		context.strokeStyle = '#003300';
		context.stroke();
	}
};