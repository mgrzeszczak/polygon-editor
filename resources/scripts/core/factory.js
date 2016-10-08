app.factory = (function(){

    function createPolygon(){
        return new app.objects.polygon();
    }

    function createVertex(x,y){
        return new app.objects.vertex(x,y);
    }

    function createEdge(from,to) {
        return new app.objects.edge(from, to);
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