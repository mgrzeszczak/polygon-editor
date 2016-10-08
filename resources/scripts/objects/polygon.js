app.objects = {};

app.objects.polygon = function(){
    this.points = [];
    this.lines = [];

    this.draw = function(ctx){

        this.lines.forEach(function(line){
           line.applyRelation();
        });

        this.lines.forEach(function(line){
            line.draw(ctx);
        });
        this.points.forEach(function(point){
            point.draw(ctx);
        });
    };

    var counter = 0;

    this.addPoint = function(point){
        this.points.push(point);
        if (this.points.length>1){
            this.lines.push(app.factory.createLineForPoly(this.points[this.points.length-2],
                this.points[this.points.length-1]))
        }
    };

    this.close = function(){
        this.lines.push(app.factory.createLineForPoly(this.points[this.points.length-1],
            this.points[0]));
    };

    this.calculateLines = function(){
        this.lines = [];
        if (this.points.length>1){
            for (var i=0;i<this.points.length-1;i++){
                this.lines.push(app.factory.createLineForPoly(this.points[i],
                    this.points[i+1]))
            }
            this.lines.push(app.factory.createLineForPoly(this.points[this.points.length-1],
                this.points[0]));
        }
    };

    this.removeVertex = function(point){
        this.points.splice(this.points.indexOf(point),1);
        this.calculateLines();
        $("img").remove();
        app.enterCreateMode();
        app.enterEditMode();
    };

    this.splitEdge = function(edge,x,y){
        var newPoint = app.factory.createPointForPoly(x,y);
        this.points.splice(this.points.indexOf(edge.from)+1,0,newPoint);
        this.calculateLines();
        $("img").remove();
        app.enterCreateMode();
        app.enterEditMode();
    };

    this.clearImgs = function(){
        this.imgs.forEach(function(img){
           img.setAttribute("class","remove");
        });
        $(".remove").remove();
    };
};