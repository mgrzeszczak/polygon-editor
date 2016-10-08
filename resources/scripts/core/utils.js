Image.prototype.setPos = function(x,y){
    this.setAttribute("style", "position:absolute;top:"+(y)+";left:"+(x)+";");
    this.x = x;
    this.y = y;
};

Image.prototype.allowDrag = function(points){
    var startPos = null;
    var drag = false;
    var self = this;
    function startDrag(e) {
        self.setAttribute("class","save");
        $("img").not(".save").remove();
        startPos = {x:e.clientX,y:e.clientY};

        self.beginPos = {x:self.x,y:self.y};
        points.forEach(function(point){
            point.beginPos={x:point.x,y:point.y};
        });
        drag = true;
        document.onmousemove=doDrag;
        return false;
    }

    function doDrag(e) {
        var diff = {x:e.clientX-startPos.x,y:e.clientY-startPos.y};

        self.setPos(self.beginPos.x+diff.x,self.beginPos.y+diff.y);
        points.forEach(function(point){
            point.x = point.beginPos.x+diff.x;
            point.y = point.beginPos.y+diff.y;
        });

        return false;
    }

    function stopDrag() {
        drag=false;
        document.body.removeChild(self);
        document.onmousemove=null;
        document.onmouseup=null;
        app.enterMoveMode();
    }

    this.onmousedown = startDrag;
    this.onmouseup = stopDrag;
    //document.addEventListener('mouseup',stopDrag);
};

Image.prototype.prompt = function(options,callback){
    bootbox.prompt({
        title: "What do you want to do?",
        inputType: 'select',
        inputOptions: options,
        callback: callback
    });
};


