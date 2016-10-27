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


CanvasRenderingContext2D.prototype.setPixel = function(x,y,color){
    //if (x<0 || x>=app.content.canvas.width || y<0 || y>=app.content.canvas.height) return;
    //var data = this.data;//pixelArray.buf;
    this.data[x+y*2000] = 255<<24;
    //data[x*4+y*4*2000]=0;
    //data[x*4+y*4*2000+1]=0;
    //data[x*4+y*4*2000+2]=0;
    //data[x*4+y*4*2000+3]=255;
    //this.fillStyle = color;
    //this.fillRect(x,y,1,1);
    /*
    this.beginPath();
    this.moveTo(x,y);
    this.lineTo(x+1,y+1);
    this.stroke();*/
};

CanvasRenderingContext2D.prototype.setPixelXY = function(x,y,color){
    this.setPixel(x,y,color);
};

CanvasRenderingContext2D.prototype.setPixelYX = function(y,x,color){
    this.setPixel(x,y,color);
};
