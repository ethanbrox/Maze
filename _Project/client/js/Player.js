var Player = {
	x: 50,
	y: 50,
	color: 'black',
	
	create: function(){
		var obj = Object.create(this);
		return obj;
	},
	
	draw: function(ctx){
		ctx.beginPath();
		ctx.fillStyle = data[i].color;
		console.log(data[i].color);
		ctx.arc(data[i].x, data[i].y, 25, 0, 2*Math.PI, false);
		ctx.fill();
	}
};