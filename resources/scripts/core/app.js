var app = (function(){

    var point = {x:0,y:0};
    var lines = [];

    function initialize(){
        registerCallbacks();
        onResize();
        requestAnimationFrame(drawLoop);
    }

    function onResize() {
        app.content.canvas.width = window.innerWidth;
        app.content.canvas.height = window.innerHeight;
        requestAnimationFrame(drawLoop);
    }

    function onMouseDown(event){
        var eventPoint = {x:event.clientX,y:event.clientY};
        var line = {p1:point,p2:eventPoint};
        rasterizeLine(line);
        lines.push(line);
        point = eventPoint;
        requestAnimationFrame(drawLoop);
    }

    function registerCallbacks(){
        window.addEventListener('resize', onResize);
        app.content.canvas.addEventListener('mousedown',onMouseDown);
    }

    function drawLoop(){
        var ctx = app.content.canvas.getContext('2d');
        ctx.clearRect(0,0,app.content.canvas.width,app.content.canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,app.content.canvas.width,app.content.canvas.height);
        ctx.drawLines(lines);
        //requestAnimationFrame(drawLoop);
    }

    /*/
     Bresenham's algorithm for line rasterization
     */
    function rasterizeLine(line){
        var p1 = line.p1;
        var p2 = line.p2;
        var a = p1.x==p2.x? 0 :(p1.y-p2.y)/(p1.x-p2.x);
        var b = p1.y-a*p1.x;

        var dx = Math.abs(p2.x-p1.x);
        var dy = Math.abs(p2.y-p1.y);

        var points = [{x:p1.x,y:p1.y}];
        var verDir = p2.y-p1.y > 0 ? 1 : -1;
        var horDir = p2.x-p1.x > 0 ? 1 : -1;

        var stepY = a*horDir;
        var stepX = a==0? 0 : (verDir)/a;

        var prev = p1;
        var real = {x:prev.x,y:prev.y};

        if(dx>=dy){
            while (prev.x!=p2.x){
                prev.x+=horDir;
                real.y+=stepY;
                if (Math.abs(real.y-prev.y)>Math.abs(real.y-prev.y-verDir)) prev.y+=verDir;
                points.push({x:prev.x,y:prev.y});
            }
        } else {
            while (prev.y!=p2.y){
                prev.y+=verDir;
                real.x+=stepX;
                if (Math.abs(real.x-prev.x)>Math.abs(real.x-prev.x-horDir)) prev.x+=horDir;
                points.push({x:prev.x,y:prev.y});
            }
        }
        line.points = points;
    }


    CanvasRenderingContext2D.prototype.drawLines = function(lines){
        var pixelArray = this.getImageData(0,0,app.content.canvas.width,app.content.canvas.height);

        lines.forEach(function(line){
            var points = line.points;
            points.forEach(function(point){
                if (point.x>app.content.canvas.width || point.y>app.content.canvas.height) return;
                pixelArray.data[point.x*4+point.y*4*app.content.canvas.width]=255;
                pixelArray.data[point.x*4+point.y*4*app.content.canvas.width+1]=255;
                pixelArray.data[point.x*4+point.y*4*app.content.canvas.width+2]=255;
                pixelArray.data[point.x*4+point.y*4*app.content.canvas.width+3]=255;
            });
        });

        this.putImageData(pixelArray,0,0);
    };

    return {
        initialize : initialize,
    };

})();