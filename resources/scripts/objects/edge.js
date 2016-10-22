app.objects.edge = function(from,to){
    this.from = from;
    this.to = to;
    this.color = app.config.lineColor;

    this.relation = new app.relation(app.relations.NULL);

    this.draw = function(ctx){
        var self = this;
        //app.algorithms.aaLine(this.from,this.to,ctx,self.relation.getColor().rgba);
        app.algorithms.drawBresenhamLine(this.from,this.to,ctx,self.relation.getColor().rgba);
        if (this.relation.type!=app.relations.NULL)
            ctx.relationImgs.push({pos:{x:(this.from.x+this.to.x)/2,y:(this.from.y+this.to.y)/2},type:this.relation.type,length:this.relation.length});
        
		/*
		ctx.stokeStyle='#FFFFFF';
        ctx.strokeStyle=this.relation.getColor().hex;
        ctx.beginPath();
        ctx.moveTo(this.from.x,this.from.y);
        ctx.lineTo(this.to.x,this.to.y);
        ctx.stroke();*/
    };
};