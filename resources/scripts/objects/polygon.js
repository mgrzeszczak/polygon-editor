app.objects = {};

app.objects.polygon = function(){
    this.vertices = [];
    this.edges = [];
    this.vertexToEdgeMap = {};
    this.fill = false;

    this.mapEdges = function(){
        this.vertexToEdgeMap = {};
        for (var i=0,len=this.vertices.length;i<len;i++){
            var vertex = this.vertices[i];
            this.vertexToEdgeMap[vertex.id] = [this.edges[i],this.edges[i-1<0?this.edges.length-1:i-1]];
        }
    };

    this.draw = function(ctx){
        var i,len;

        for (i=0,len=this.edges.length;i<len;i++) this.edges[i].draw(ctx);

        if (this.closed==true && this.fill==true)
            app.algorithms.fillPolygon(ctx,this);


    };

    this.addVertex = function(vertex){
        vertex.polygon = this;
        this.vertices.push(vertex);
        if (this.vertices.length==1) return;
        this.edges.push(app.factory.createEdge(this.vertices[this.vertices.length-2],
            this.vertices[this.vertices.length-1]));
    };

    this.close = function(){
        if (this.vertices.length<3) return false;
        this.edges.push(app.factory.createEdge(this.vertices[this.vertices.length-1],
            this.vertices[0]));
        this.mapEdges();
        this.closed = true;
        return true;
    };

    this.removeVertex = function(vertex){
        var index = this.vertices.indexOf(vertex);

        var edge = app.factory.createEdge(this.vertices[index-1<0?this.vertices.length-1:index-1],
            this.vertices[index+1>=this.vertices.length?0:index+1]);

        this.vertices.splice(index,1);

        this.edges.splice(index,1);
        this.edges.splice(index-1<0?this.edges.length-1:index-1,1);
        this.edges.splice(index-1<0?this.edges.length-1:index-1,0,edge);

        if (this.vertices.length<3) app.removePoly(this);
        else this.mapEdges();

        app.utils.clearImages();
        app.enterCreateMode();
        app.enterEditMode();
    };

    this.splitEdge = function(edge,x,y){
        var vertex = app.factory.createVertex(x,y);
        vertex.polygon = this;
        var e1 = app.factory.createEdge(edge.from,vertex);
        var e2 = app.factory.createEdge(vertex,edge.to);

        this.vertices.splice(this.vertices.indexOf(edge.from)+1,0,vertex);
        this.edges.splice(this.edges.indexOf(edge),1,e1,e2);

        this.mapEdges();

        app.utils.clearImages();
        app.enterCreateMode();
        app.enterEditMode();
    };

    this.changeEdgeColor = function(color){
        this.edges.forEach(function(edge){
           edge.color = color;
        });
    };

    this.clearImgs = function(){
        this.imgs.forEach(function(img){
           img.setAttribute("class","remove");
        });
        $(".remove").remove();
    };

	this.clone = function(){
		var obj = new app.objects.polygon();
		this.vertices.forEach(function(v){
			obj.addVertex(new app.objects.vertex(v.x,v.y));
		});
		obj.close();
		obj.edges.forEach(function(e){
			e.cloned = true;
			e.color = '#D3D3D3';
		});
		return obj;
	};
};