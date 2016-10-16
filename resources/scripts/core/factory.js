app.factory = (function(){

    var vertexId = 0;
    var edgeId = 0;
    var polygonId = 0;

    function createPolygon(){
        var polygon = new app.objects.polygon();
        polygon.id = polygonId++;
        return polygon;
    }

    function createVertex(x,y){
        var vertex =  new app.objects.vertex(x,y);
        vertex.id = vertexId++;
        return vertex;
    }

    function createEdge(from,to) {
        var edge = new app.objects.edge(from, to);
        edge.id = edgeId++;
        return edge;
    }

    function createImage(src,x,y,width,height){
        var img = document.createElement("img");
        img.x = x;
        img.y = y;
        img.width = width;
        img.height = height;
        img.setAttribute('src', src);
        img.setAttribute('height', height+"px");
        img.setAttribute('width', width+"px");
        img.setAttribute("style", "position:absolute;top:"+y+";left:"+x+";");
        return img;
    }

    return {
        createPolygon : createPolygon,
        createEdge : createEdge,
        createVertex : createVertex,
        createImage : createImage
    }

})();