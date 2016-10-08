app.objects.vertex = function(x,y){
    this.x = x;
    this.y = y;
    this.color = app.config.pointColor;

    this.clone = function(){
        return app.factory.createVertex(this.x,this.y);
    };

    this.draw = function(ctx){
        ctx.setPixel(this,this.color);
    };

};