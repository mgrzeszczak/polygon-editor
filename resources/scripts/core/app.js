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
        ctx.fillStyle = '#000000';
        ctx.fillRect(0,0,app.content.canvas.width,app.content.canvas.height);
        ctx.pixelArray = ctx.getImageData(0,0,app.content.canvas.width,app.content.canvas.height);
        objects.forEach(function(obj){
            obj.draw(ctx);
        });
        ctx.putImageData(ctx.pixelArray,0,0);
        requestAnimationFrame(drawLoop);
    }

    CanvasRenderingContext2D.prototype.setPixel = function(pixel,color){
        if (pixel.x<0 || pixel.x>=app.content.canvas.width || pixel.y<0 || pixel.y>=app.content.canvas.height) return;
        this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width]=color.r;
        this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width+1]=color.g;
        this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width+2]=color.b;
        this.pixelArray.data[pixel.x*4+pixel.y*4*app.content.canvas.width+3]=color.a;
    };

    function pushVertex(vertex){
        poly.addPoint(app.factory.createPointForPoly(vertex.x,vertex.y,poly));

    }
    function finishPoly(){
        poly.close();
        poly = app.factory.createPolygon();
        objects.push(poly);
    }

    function enterEditMode(){

        objects.forEach(function(obj){

            obj.imgs = [];

            obj.points.forEach(function(point){
                var img = app.factory.createImage(app.content.editIcon,point.x-10,point.y-10,20,20);
                obj.imgs.push(img);
                img.onclick=function(){
                    img.prompt([{text:"Remove vertex",value:1}],function(result){
                        if (result == 1){
                            obj.removeVertex(point);
                        }
                    });
                };
                document.body.appendChild(img);
            });

            obj.lines.forEach(function(line){
                var center = {x:(line.to.x+line.from.x)/2,y:(line.to.y+line.from.y)/2};
                var img = app.factory.createImage(app.content.editIcon,center.x-10,center.y-10,20,20);
                obj.imgs.push(img);
                img.onclick=function(){
                    img.prompt([
                        {text:"Split edge",value:1},
                        {text:"Add relation length 10",value:2}
                    ],function(result){
                        console.log(result);
                        if (result==1){
                            obj.splitEdge(line,img.x,img.y);
                        } else if (result == 2){
                            line.relation = new app.relation(app.relations.LENGTH,200);
                            console.log(line.relation);
                        }
                    });
                };
                document.body.appendChild(img);
            });

            if (obj.points.length==0) return;
            var firstPoint = obj.points[0];

            var img = app.factory.createImage(app.content.editIcon,firstPoint.x-50,firstPoint.y-50,30,30);
            obj.imgs.push(img);
            img.onclick=function(){
              img.prompt([{text:"Remove polygon",value:1}],function(result){
                  if (result == 1){
                      objects.splice(objects.indexOf(obj),1);
                      obj.imgs.forEach(function(img){
                         img.setAttribute("class","remove");
                      });
                      $(".remove").remove();
                  }
              });
            };
            document.body.appendChild(img);
        });
    }

    function enterMoveMode(){
        objects.forEach(function(obj){

            obj.points.forEach(function(point){
                var img = app.factory.createImage(app.content.moveIcon,point.x-10,point.y-10,20,20);
                img.allowDrag([point]);
                document.body.appendChild(img);
            });
            if (obj.points.length==0) return;
            var firstPoint = obj.points[0];

            var img = app.factory.createImage(app.content.moveIcon,firstPoint.x-50,firstPoint.y-50,30,30);
            img.allowDrag(obj.points);
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

        enterEditMode : enterEditMode,
        enterCreateMode : enterCreateMode,
        enterMoveMode : enterMoveMode
    };

})();