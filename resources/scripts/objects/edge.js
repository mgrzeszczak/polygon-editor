app.objects.edge = function(from,to){
    this.from = from;
    this.to = to;
    this.color = app.config.lineColor;
    this.relation = new app.relation(app.relations.NULL);

    this.draw = function(ctx){
        var self = this;
        //app.algorithms.aaLine(this.from,this.to,ctx,this.cloned==true? this.color : self.relation.getColor().hex);
        app.algorithms.drawBresenhamLine(this.from,this.to,ctx,this.cloned==true? this.color : self.relation.getColor().hex);
        if (this.relation.type!=app.relations.NULL)
            ctx.relationImgs.push({pos:{x:(this.from.x+this.to.x)/2,y:(this.from.y+this.to.y)/2},type:this.relation.type,length:this.relation.length});
    };
};