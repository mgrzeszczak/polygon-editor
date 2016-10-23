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
        if (vertices.length==1) vertices[0].moving = true;
        return false;
    }



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
            /*vertex.polygon.edges.forEach(function(edge){
               if (!edge.relation.check(edge)) alert('Glitched!');
            });*/
        }

        return false;
    }

    function stopDrag() {
        if (vertices.length==1) vertices[0].moving = false;
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

/*
CanvasRenderingContext2D.prototype.setPixel = function(pixel,color){
    if (pixel.x<0 || pixel.x>=app.content.canvas.width || pixel.y<0 || pixel.y>=app.content.canvas.height) return;
    this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width]=color.r;
    this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width+1]=color.g;
    this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width+2]=color.b;
    this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width+3]=color.a;
};*/

CanvasRenderingContext2D.prototype.setPixel = function(x,y,color){
    this.strokeStyle = color;
    this.beginPath();
    this.moveTo(x,y);
    this.lineTo(x+1,y+1);
    this.stroke();
};

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbaToHex(r, g, b,a) {
    return "#" +componentToHex(a)+ componentToHex(r) + componentToHex(g) + componentToHex(b);
}


CanvasRenderingContext2D.prototype.setPixelXY = function(x,y,color){
    //console.log(color);
    this.setPixel(x,y,color);
    /*var width = app.content.canvas.width;
    if (x<0 || x>=width || y<0 || y>=app.content.canvas.height) return;
    this.pixelArray.data[x*4+y*4*width]=color.r;
    this.pixelArray.data[x*4+y*4*width+1]=color.g;
    this.pixelArray.data[x*4+y*4*width+2]=color.b;
    this.pixelArray.data[x*4+y*4*width+3]=color.a;*/
};

CanvasRenderingContext2D.prototype.setPixelYX = function(y,x,color){
    this.setPixel(x,y,color);
    /*var width = app.content.canvas.width;
    if (x<0 || x>=width || y<0 || y>=app.content.canvas.height) return;
    this.pixelArray.data[x*4+y*4*width]=color.r;
    this.pixelArray.data[x*4+y*4*width+1]=color.g;
    this.pixelArray.data[x*4+y*4*width+2]=color.b;
    this.pixelArray.data[x*4+y*4*width+3]=color.a;*/
};
