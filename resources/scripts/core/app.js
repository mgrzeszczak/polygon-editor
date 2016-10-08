var app = (function(){

    var objects = [];
    var poly = null;

    function initialize(){
        registerCallbacks();
        app.callbacks.onResize();
        app.mode.setMode(app.modes.CREATE);
        requestAnimationFrame(drawLoop);
    }

    function registerCallbacks(){
        window.addEventListener('resize', app.callbacks.onResize);
        app.content.canvas.addEventListener('mousedown',app.callbacks.onMouseDown,true);
        document.addEventListener('keydown',app.callbacks.onKeyDown,true);
        document.addEventListener('mousemove',app.callbacks.onMouseMove,true);
    }

    function drawLoop(){
        var ctx = app.content.canvas.getContext('2d');
        ctx.fillStyle = app.config.background;
        ctx.fillRect(0,0,app.content.canvas.width,app.content.canvas.height);
        ctx.pixelArray = ctx.getImageData(0,0,app.content.canvas.width,app.content.canvas.height);
        objects.forEach(function(obj){
            obj.draw(ctx);
        });
        ctx.putImageData(ctx.pixelArray,0,0);
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
                    img.prompt('Edit edge',[
                        {text:"Split",value:1},
                        {text:"Set length",value:2},
                        {text:"Set vertical",value:3},
                        {text:"Set horizontal",value:4},
                    ],function(result){
                        if (result==1){
                            obj.splitEdge(edge,img.x,img.y);
                        } else if (result==2){
                            var n = prompt('Length:');
                            if (isNaN(n) || n<0 || n>1000) return;
                            edge.relation = new app.relation(app.relations.LENGTH,n);
                        } else if (result==3){
                            edge.relation = new app.relation(app.relations.VERTICAL);
                        } else if (result==4){
                            edge.relation = new app.relation(app.relations.HORIZONTAL);
                        }
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
              img.prompt('Edit polygon',[{text:"Remove",value:1}],function(result){
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
            obj.vertices.forEach(function(vertex){
                var img = app.factory.createImage(app.config.moveIcon,vertex.x-app.config.smallImageSize/2,
                    vertex.y-app.config.smallImageSize/2,app.config.smallImageSize,app.config.smallImageSize);
                img.allowDrag([vertex]);
                document.body.appendChild(img);
            });
            if (obj.vertices.length==0) return;
            var firstVertex = obj.vertices[0];

            var img = app.factory.createImage(app.config.moveIcon,firstVertex.x-2*app.config.mediumImageSize,
                firstVertex.y-2*app.config.mediumImageSize,app.config.mediumImageSize,app.config.mediumImageSize);
            img.allowDrag(obj.vertices);
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
        enterMoveMode : enterMoveMode
    };

})();