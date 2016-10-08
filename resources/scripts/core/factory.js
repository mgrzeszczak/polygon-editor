app.factory = (function(){

    function createPolygon(){
        return new app.objects.polygon();
    }

    function createPointForPoly(x,y,poly){
        return new app.objects.point(x,y,poly);
    }

    function createLineForPoly(from,to,poly) {
        return new app.objects.line(from, to, poly);
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
        createLineForPoly : createLineForPoly,
        createPointForPoly : createPointForPoly,
        createImage : createImage
    }

})();