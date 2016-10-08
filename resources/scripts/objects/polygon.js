app.objects = {};

app.objects.polygon = function(){
    this.vertices = [];
    this.edges = [];

    this.draw = function(ctx){
        this.edges.forEach(function(edge){
           edge.relation.apply(edge);
        });
        this.edges.forEach(function(edge){
            edge.draw(ctx);
        });
        this.vertices.forEach(function(vertex){
            vertex.draw(ctx);
        });
    };

    var counter = 0;

    this.addVertex = function(vertex){
        this.vertices.push(vertex);
        if (this.vertices.length==1) return;
        this.edges.push(app.factory.createEdge(this.vertices[this.vertices.length-2],
            this.vertices[this.vertices.length-1]));
    };

    this.close = function(){
        this.edges.push(app.factory.createEdge(this.vertices[this.vertices.length-1],
            this.vertices[0]));
        return this.vertices.length>=3;
    };

    /*
    this.calculateEdges = function(){
        this.edges = [];
        if (this.vertices.length>1){
            for (var i=0;i<this.vertices.length-1;i++){
                this.edges.push(app.factory.createEdge(this.vertices[i],
                    this.vertices[i+1]))
            }
            this.edges.push(app.factory.createEdge(this.vertices[this.vertices.length-1],
                this.vertices[0]));
        }
    };*/

    this.removeVertex = function(vertex){
        var index = this.vertices.indexOf(vertex);

        var edge = app.factory.createEdge(this.vertices[index-1<0?this.vertices.length-1:index-1],
            this.vertices[index+1>=this.vertices.length?0:index+1]);

        this.vertices.splice(index,1);

        this.edges.splice(index,1);
        this.edges.splice(index-1<0?this.edges.length-1:index-1,1);
        this.edges.splice(index-1<0?this.edges.length-1:index-1,0,edge);

        if (this.vertices.length<3) app.removePoly(this);

        app.utils.clearImages();
        app.enterCreateMode();
        app.enterEditMode();
    };

    this.removeEdge = function(edge){

    };

    this.splitEdge = function(edge,x,y){
        var vertex = app.factory.createVertex(x,y);
        var e1 = app.factory.createEdge(edge.from,vertex);
        var e2 = app.factory.createEdge(vertex,edge.to);

        this.vertices.splice(this.vertices.indexOf(edge.from)+1,0,vertex);
        this.edges.splice(this.edges.indexOf(edge),1,e1,e2);

        app.utils.clearImages();
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