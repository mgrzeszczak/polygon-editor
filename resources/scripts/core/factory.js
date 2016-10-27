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
		img.allowDrag = allowDrag.bind(img)
		img.prompt = bootBoxPrompt.bind(img);
		img.setPos = setPos.bind(img);
        return img;
    }

    function setPos(x,y){
        this.setAttribute("style", "position:absolute;top:"+(y)+";left:"+(x)+";");
        this.x = x;
        this.y = y;
    }

    function bootBoxPrompt(title,options,callback){
        bootbox.prompt({
            title : title,
            inputType: 'select',
            inputOptions: options,
            callback: callback
        });
    }

    function allowDrag(vertices,img){

        var startPos = null;
        var self = this;

        function startDrag(e) {
            app.setGhostCopy(img.obj.clone());
            self.setAttribute("class","save");
            $("img").not(".save").remove();
            startPos = {x:e.clientX,y:e.clientY};
            self.beginPos = {x:self.x,y:self.y};
            vertices.forEach(function(vertex){
                vertex.beginPos={x:vertex.x,y:vertex.y};
            });
            document.onmousemove=doDrag;
            if (vertices.length==1) vertices[0].moving = true;
            return false;
        }
        startDrag.img = img;


        function doDrag(e) {
            var diff = {x:e.clientX-startPos.x,y:e.clientY-startPos.y};

            self.setPos(self.beginPos.x+diff.x,self.beginPos.y+diff.y);
            if (vertices.length>1){
                vertices.forEach(function(vertex){
                    vertex.x = vertex.beginPos.x+diff.x;
                    vertex.y = vertex.beginPos.y+diff.y;
                });
            } else {
                var vertex = vertices[0];
                vertex.polygon.vertices.forEach(function(v){
                    v.visited = false;
                });
                vertex.move(vertex.beginPos.x+diff.x,vertex.beginPos.y+diff.y);
            }

            return false;
        }

        function stopDrag() {
            if (vertices.length==1) vertices[0].moving = false;
            document.body.removeChild(self);
            document.onmousemove=null;
            app.setGhostCopy(null);
            app.enterMoveMode();
        }

        this.onmousedown = startDrag;
        this.onmouseup = stopDrag;
    }

    return {
        createPolygon : createPolygon,
        createEdge : createEdge,
        createVertex : createVertex,
        createImage : createImage
    }

})();