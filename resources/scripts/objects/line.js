app.objects.line = function(from,to,poly){
    this.from = from;
    this.to = to;
    this.poly = poly;
    this.color = app.content.lineColor;

    this.relation = null;

    this.draw = function(ctx){
        var points = app.cache.getLine(this.from,this.to);
        var self = this;
        points.forEach(function(point){
            ctx.setPixel(point,self.color);
        });
    };

    this.applyRelation = function(){
        if (this.relation==null) return;
        switch (this.relation.type){
            case app.relations.HORIZONTAL:

                break;
            case app.relations.VERTICAL:

                break;
            case app.relations.LENGTH:
                var dist = this.from.dist(this.to);
                var vec = {x:(this.to.x-this.from.x)/dist,y:(this.to.y-this.from.y)/dist};
                vec.x *=this.relation.length;
                vec.y *=this.relation.length;
                this.to.x = Math.round(this.from.x+vec.x);
                this.to.y = Math.round(this.from.y+vec.y);

                break;
        }
    };

    this.checkRelation = function(){
        if (this.relation==null) return true;
        switch (this.relation){
            case app.relations.HORIZONTAL:
                break;
            case app.relations.VERTICAL:
                break;
            case app.relations.LENGTH:
                break;
        }
    };
};