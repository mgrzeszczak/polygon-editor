app.objects.edge = function(from,to){
    this.from = from;
    this.to = to;
    this.color = app.config.lineColor;

    this.relation = new app.relation(app.relations.NULL);

    this.draw = function(ctx){
        var points = app.cache.getLine(this.from,this.to);
        var self = this;
        points.forEach(function(point){
            ctx.setPixel(point,self.color);
        });
    };
};