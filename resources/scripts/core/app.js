var app = (function(){

    var objects = [];
    var poly = null;
	var ghostCopy = null;

    var canvas = document.getElementById('app-canvas');
    var ctx = canvas.getContext('2d');
    var memCanvas;
    var memCtx;

    function initialize(){
        registerCallbacks();
        app.callbacks.onResize();
        app.mode.setMode(app.modes.CREATE);

        app.lastDate = Date.now();
        app.framesCount = 0;

        app.mwidth = 1920;
        app.mheight= 1080;

        memCanvas = document.createElement('canvas');
        memCanvas.width = app.mwidth;
        memCanvas.height = app.mheight;
        memCtx = memCanvas.getContext('2d');
        memCtx.pixelArray = memCtx.getImageData(0,0,memCanvas.width,memCanvas.height);
        memCtx.buf = new ArrayBuffer(memCtx.pixelArray.data.length);
        memCtx.buf8 = new Uint8ClampedArray(memCtx.buf);
        memCtx.data = new Uint32Array(memCtx.buf);

        requestAnimationFrame(drawLoop);
    }

    function registerCallbacks(){
        window.addEventListener('resize', app.callbacks.onResize);
        app.content.canvas.addEventListener('mousedown',app.callbacks.onMouseDown,true);
        document.addEventListener('keydown',app.callbacks.onKeyDown,true);
        document.addEventListener('mousemove',app.callbacks.onMouseMove,true);
    }

    function drawLoop(){
        var i,len;
        // FPS
        if (Date.now() - app.lastDate > 1000) {
            console.log(app.framesCount + ' ' + (Date.now()-app.lastDate));
            app.lastDate = Date.now();
            app.framesCount = 1;
        }
        else {
            app.framesCount++;
        }

        ctx.clearRect(0,0,canvas.width,canvas.height);
        var tmp = ctx;
        ctx = memCtx;

        var data = ctx.data;
        var offset;
        for (i=0,len = app.mwidth*app.mwidth/8;i<len;i++){
            offset = i;
            data[offset] = 0;
            offset += len;
            data[offset] = 0;
            offset += len;
            data[offset] = 0;
            offset += len;
            data[offset] = 0;
            offset += len;
            data[offset] = 0;
            offset += len;
            data[offset] = 0;
            offset += len;
            data[offset] = 0;
            offset += len;
            data[offset] = 0;
        }

        var v1 = {x:0,y:0};
        var v2 = {x:1800,y:1000};
        var color = {r:0,g:0,b:0,a:255};

        for (i=0;i<5000;i++){
            app.algorithms.drawBresenhamLine(v1,v2,ctx,color);
        }

        for(i=0,len=objects.length;i<len;i++){
            objects[i].draw(ctx);
        }

        /*
        ctx.relationImgs = [];
		if (ghostCopy!=null) ghostCopy.draw(ctx);
        ctx.relationImgs.forEach(function(imgData){
            var img = new Image();
            switch (imgData.type){
                case app.relations.VERTICAL:
                    img.src='resources/images/vertical-icon.png';
                    break;
                case app.relations.HORIZONTAL:
                    img.src='resources/images/horizontal_icon.png';
                    break;
                case app.relations.LENGTH:
                    ctx.fillStyle='black';
                    ctx.font='15px Arial';
                    ctx.fillText(imgData.length,imgData.pos.x-app.config.mediumImageSize,imgData.pos.y);
                    return;
            }
           ctx.drawImage(img,imgData.pos.x-app.config.mediumImageSize,imgData.pos.y-app.config.mediumImageSize,app.config.mediumImageSize,app.config.mediumImageSize);
        });
        */

        ctx.pixelArray.data.set(ctx.buf8);
        ctx.putImageData(ctx.pixelArray,0,0);
        ctx = tmp;
        ctx.drawImage(memCanvas,0,0);
        requestAnimationFrame(drawLoop);
    }

    function pushVertex(vertex){
        poly.addVertex(app.factory.createVertex(vertex.x,vertex.y));

    }
    function finishPoly(){
        if (!poly.close()) objects.splice(objects.indexOf(poly),1);
        poly = app.factory.createPolygon();
        objects.push(poly);
    }

    function removePoly(poly){
        objects.splice(objects.indexOf(poly),1);
    }

    function enterEditMode(){
        objects.forEach(function(obj){
            obj.imgs = [];

            obj.vertices.forEach(function(vertex){
                var img = app.factory.createImage(app.config.editIcon,vertex.x-app.config.smallImageSize/2,
                    vertex.y-app.config.smallImageSize/2,app.config.smallImageSize,app.config.smallImageSize);
                obj.imgs.push(img);
                img.onclick=function(){
                    img.prompt('Edit vertex',[{text:"Remove",value:1}],function(result){
                        if (result == 1){
                            obj.removeVertex(vertex);
                            app.mode.setMode(app.modes.CREATE);
                            app.mode.setMode(app.modes.EDIT);
                        }
                    });
                };
                document.body.appendChild(img);
            });

            obj.edges.forEach(function(edge){
                var center = {x:(edge.to.x+edge.from.x)/2,y:(edge.to.y+edge.from.y)/2};
                var img = app.factory.createImage(app.config.editIcon,center.x-app.config.smallImageSize/2,
                    center.y-app.config.smallImageSize/2,app.config.smallImageSize,app.config.smallImageSize);
                obj.imgs.push(img);
                img.onclick=function(){
                    img.prompt('Edit edge - relation: '+edge.relation.getName(),[
                        {text:"Split",value:1},
                        {text:"Set length",value:2},
                        {text:"Set vertical",value:3},
                        {text:"Set horizontal",value:4},
                        {text:"Set none",value:5}
                    ],function(result){
                        switch (~~result){
                            case 1:
                                obj.splitEdge(edge,img.x,img.y);
                                break;
                            case 2:
                                var n = prompt('Length:');
                                if (isNaN(n) || n<0 || n>1000) return;
                                edge.relation = new app.relation(app.relations.LENGTH,n);
                                break;
                            case 3:
                                edge.relation = new app.relation(app.relations.VERTICAL);
                                break;
                            case 4:
                                edge.relation = new app.relation(app.relations.HORIZONTAL);
                                break;
                            case 5:
                                edge.relation = new app.relation(app.relations.NULL);
                                break;
                        }

                        var apply = function(){
                            obj.vertices.forEach(function(v){
                                v.visited = false;
                            });
                            edge.from.move(edge.from.x,edge.from.y);
                            obj.vertices.forEach(function(v){
                                v.visited = false;
                            });
                            edge.to.move(edge.to.x,edge.to.y);
                        };
                        apply();
                        var ok = true;
                        obj.edges.forEach(function(edge){
                            if (!edge.relation.check(edge)) {
                                ok = false;
                                console.log(edge.id+' glitched '+edge.relation.check(edge));
                                console.log(edge.from.x+' '+edge.from.y+' - '+edge.to.x+' '+edge.to.y);
                            }
                        });
                        if (!ok) {
                            alert('Cannot do that!');
                            edge.relation = new app.relation(app.relations.NULL);
                            apply();
                        }
                        app.mode.setMode(app.modes.CREATE);
                        app.mode.setMode(app.modes.EDIT);
                    });
                };
                document.body.appendChild(img);
            });

            if (obj.vertices.length==0) return;
            var firstVertex = obj.vertices[0];

            var img = app.factory.createImage(app.config.editIcon,firstVertex.x-2*app.config.mediumImageSize,
                firstVertex.y-2*app.config.mediumImageSize,app.config.mediumImageSize,app.config.mediumImageSize);
            obj.imgs.push(img);
            img.onclick=function(){
              img.prompt('Edit polygon',[{text:"Remove",value:1},{text:"Fill",value:2}],function(result){
                  if (result == 1){
                      objects.splice(objects.indexOf(obj),1);
                      obj.clearImgs();
                  }
              });
            };
            document.body.appendChild(img);
        });
    }

    function enterMoveMode(){
        objects.forEach(function(obj){
            var meanVertex = {x:0,y:0};

            obj.vertices.forEach(function(vertex){
                meanVertex.x+=(vertex.x);
                meanVertex.y+=(vertex.y);
                var img = app.factory.createImage(app.config.moveIcon,vertex.x-app.config.smallImageSize/2,
                    vertex.y-app.config.smallImageSize/2,app.config.smallImageSize,app.config.smallImageSize);

				img.obj = obj;
                img.allowDrag([vertex],img);
                document.body.appendChild(img);
            });
            if (obj.vertices.length==0) return;

            meanVertex.x/=obj.vertices.length;
            meanVertex.y/=obj.vertices.length;

            var img = app.factory.createImage(app.config.moveIcon,meanVertex.x-2*app.config.mediumImageSize,
                meanVertex.y-2*app.config.mediumImageSize,app.config.mediumImageSize,app.config.mediumImageSize);
				img.obj = obj;
            img.allowDrag(obj.vertices,img);
            document.body.appendChild(img);
        });
    }

    function enterCreateMode(){
        poly = app.factory.createPolygon();
        objects.push(poly);
    }

    return {
        initialize : initialize,
        pushVertex : pushVertex,
        finishPoly : finishPoly,
        removePoly : removePoly,

        enterEditMode : enterEditMode,
        enterCreateMode : enterCreateMode,
        enterMoveMode : enterMoveMode,

        getFirstPoly : function(){
            return objects[0];
        },
		
		setGhostCopy : function(obj){
            ghostCopy=obj;
        }
    };

})();