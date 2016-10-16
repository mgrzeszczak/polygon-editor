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
        if (this.relation.type!=app.relations.NULL)
            ctx.relationImgs.push({pos:{x:(this.from.x+this.to.x)/2,y:(this.from.y+this.to.y)/2},type:this.relation.type,length:this.relation.length});
        /*
        ctx.strokeStyle=this.relation.getColor().hex;
        ctx.beginPath();
        ctx.moveTo(this.from.x,this.from.y);
        ctx.lineTo(this.to.x,this.to.y);
        ctx.stroke();*/
    };
};