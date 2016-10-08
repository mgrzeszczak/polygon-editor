app.objects.point = function(x,y,poly){
    this.x = x;
    this.y = y;
    this.poly = poly;
    this.color = app.content.pointColor;

    this.clone = function(){
        return new app.objects.point(this.x,this.y);
    };

    this.draw = function(ctx){
        ctx.setPixel(this,this.color);
    };

    this.dist = function(point){
        var xDiff = point.x-this.x;
        var yDiff = point.y-this.y;
        return Math.sqrt(xDiff*xDiff+yDiff*yDiff);
    };
};