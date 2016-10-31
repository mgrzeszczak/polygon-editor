var app = (function(){

    var objects = [];
    var poly = null;
	var ghostCopy = null;

    var canvas = document.getElementById('app-canvas');
    var ctx = canvas.getContext('2d');
    var memCanvas;
    var memCtx;

    var texture;
    var texCanvas;
    var texCtx;

    var hmap;
    var hCanvas;
    var hCtx;

    function initialize(){
        registerCallbacks();
        app.callbacks.onResize();
        app.mode.setMode(app.modes.CREATE);

        app.lastDate = Date.now();
        app.framesCount = 0;

        app.mwidth = 1920;
        app.mheight= 1080;

        app.lx = window.innerWidth/2;
        app.ly = window.innerHeight/2;
        app.lz = 10;

        texture = new Image();
        texture.src = 'resources/images/wood.jpg';
        texture.onload=function(){
            texCanvas = document.createElement('canvas');
            texCtx = texCanvas.getContext('2d');
            texCanvas.width = texture.width;
            texCanvas.height = texture.height;
            texCtx.drawImage(texture,0,0);

            app.texture = texCtx.getImageData(0,0,texCanvas.width,texCanvas.height).data;

            app.texWidth = texCanvas.width;
            app.texHeight = texCanvas.height;

            var buf = new ArrayBuffer(app.texture.length);
            var data8 = new Uint8Array(buf);
            var data = new Uint32Array(buf);
            data8.set(app.texture);

            app.texture = data;
        };

        hmap = new Image();
        hmap.src = 'resources/images/bumpwood2.jpg';
        hmap.onload = function(){
            hCanvas = document.createElement('canvas');
            hCanvas.width = this.width;
            hCanvas.height = this.height;
            hCtx = hCanvas.getContext('2d');
            hCtx.drawImage(this,0,0);
            processHeightMap(hCtx.getImageData(0,0,hCanvas.width,hCanvas.height).data,hCanvas.width,hCanvas.height);
        };

        memCanvas = document.createElement('canvas');
        memCanvas.width = app.mwidth;
        memCanvas.height = app.mheight;
        memCtx = memCanvas.getContext('2d');
        memCtx.pixelArray = memCtx.getImageData(0,0,memCanvas.width,memCanvas.height);
        memCtx.buf = new ArrayBuffer(memCtx.pixelArray.data.length);
        memCtx.buf8 = new Uint8ClampedArray(memCtx.buf);
        memCtx.data = new Uint32Array(memCtx.buf);

        /*
        pushVertex(app.factory.createVertex(0,0));
        pushVertex(app.factory.createVertex(0,window.innerHeight));
        pushVertex(app.factory.createVertex(window.innerWidth,window.innerHeight));
        pushVertex(app.factory.createVertex(window.innerWidth,0));
        finishPoly();*/

        requestAnimationFrame(drawLoop);
    }

    function processHeightMap(hmap,width,height){
        var buffer = new ArrayBuffer(3*Float32Array.BYTES_PER_ELEMENT*width*height);
        var data = new Float32Array(buffer);
        for (var i=0;i<width;i++){
            for (var j=0;j<height;j++){
                var tx = i;
                var ty = j;
                var sx = hmap[4*(tx<width-1?tx+1:tx)+4*ty*width] - hmap[(tx==0? tx : tx-1)*4 + 4*ty*width];
                if (tx == 0 || tx == width-1)
                    sx *= 2;

                var sy = hmap[4*tx+4*width*(ty<height-1?ty+1:ty)] - hmap[4*tx+4*width*(ty==0?ty:ty-1)];
                if (ty == 0 || ty == height -1)
                    sy *= 2;
                var hmapNormalX = -sx/255;
                var hmapNormalY = -sy/255;
                var hmapNormalZ = 2;

                inv = 1/Math.sqrt(hmapNormalX*hmapNormalX+hmapNormalY*hmapNormalY+hmapNormalZ*hmapNormalZ);
                hmapNormalX*=inv;
                hmapNormalY*=inv;
                hmapNormalZ*=inv;


                data[3*i+3*j*width] = hmapNormalX;
                data[3*i+3*j*width+1] = hmapNormalY;
                data[3*i+3*j*width+2] = hmapNormalZ;
            }
        }
        app.hMap = data;
        app.hMapWidth = width;
        app.hMapHeight= height;
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
        /*if (Date.now() - app.lastDate > 1000) {
            console.log(app.framesCount + ' ' + (Date.now()-app.lastDate));
            app.lastDate = Date.now();
            app.framesCount = 1;
        }
        else {
            app.framesCount++;
        }*/
        //ctx.clearData();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var tmp = ctx;
        ctx = memCtx;
        ctx.data.fill(0xffffffff);

        var v1 = {x:0,y:0};
        var v2 = {x:1800,y:1000};

        /*
        for (i=0;i<2500;i++){
            app.algorithms.drawBresenhamLine(v1.x,v1.y,v2.x,v2.y,ctx,255<<24);
        }*/


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

    function addPoly(poly){
        console.log('Adding: ');
        console.log(poly);
        objects.unshift(poly);
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
        addPoly : addPoly,

        enterEditMode : enterEditMode,
        enterCreateMode : enterCreateMode,
        enterMoveMode : enterMoveMode,

        getFirstPoly : function(){
            return objects[0];
        },
		
		setGhostCopy : function(obj){
            ghostCopy=obj;
        },

        getPolys : function(){
            return objects;
        }
    };

})();