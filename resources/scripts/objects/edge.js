app.objects.edge = function(from,to){
    this.from = from;
    this.to = to;
    this.color = app.config.lineColor;

    this.relation = new app.relation(app.relations.NULL);

    this.draw = function(ctx){
        var points = app.cache.getLine(this.from,this.to);
        //var points = app.algorithms.bresenham(this.from,this.to);
        var self = this;
        points.forEach(function(point){
            ctx.setPixel(point,self.relation.getColor().rgba);
        });

        /*
        ctx.strokeStyle=this.relation.getColor().hex;
        ctx.beginPath();
        ctx.moveTo(this.from.x,this.from.y);
        ctx.lineTo(this.to.x,this.to.y);
        ctx.stroke();*/
    };
};