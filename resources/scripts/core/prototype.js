Image.prototype.setPos = function(x,y){
    this.setAttribute("style", "position:absolute;top:"+(y)+";left:"+(x)+";");
    this.x = x;
    this.y = y;
};

Image.prototype.allowDrag = function(vertices){
    var startPos = null;
    var self = this;

    function startDrag(e) {
        self.setAttribute("class","save");
        $("img").not(".save").remove();
        startPos = {x:e.clientX,y:e.clientY};

        self.beginPos = {x:self.x,y:self.y};
        vertices.forEach(function(vertex){
            vertex.beginPos={x:vertex.x,y:vertex.y};
        });
        document.onmousemove=doDrag;
        return false;
    }

    function doDrag(e) {
        var diff = {x:e.clientX-startPos.x,y:e.clientY-startPos.y};

        self.setPos(self.beginPos.x+diff.x,self.beginPos.y+diff.y);
        vertices.forEach(function(vertex){
            vertex.x = vertex.beginPos.x+diff.x;
            vertex.y = vertex.beginPos.y+diff.y;
        });
        return false;
    }

    function stopDrag() {
        document.body.removeChild(self);
        document.onmousemove=null;
        app.enterMoveMode();
    }

    this.onmousedown = startDrag;
    this.onmouseup = stopDrag;
};

Image.prototype.prompt = function(title,options,callback){
    bootbox.prompt({
        title : title,
        inputType: 'select',
        inputOptions: options,
        callback: callback
    });
};

CanvasRenderingContext2D.prototype.setPixel = function(pixel,color){
    if (pixel.x<0 || pixel.x>=app.content.canvas.width || pixel.y<0 || pixel.y>=app.content.canvas.height) return;
    this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width]=color.r;
    this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width+1]=color.g;
    this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width+2]=color.b;
    this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width+3]=color.a;
};