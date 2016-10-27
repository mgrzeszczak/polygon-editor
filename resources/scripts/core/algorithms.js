app.algorithms = (function(){

    function scan_line(ctx,polygon){
            var edges = polygon.edges;

            var yMin = edges[0].from.y;
            var yMax = edges[0].from.y;

            var et = {};

            edges.forEach(function(edge){
                var from = edge.from;
                var to = edge.to;

                //if (from.y==to.y) return;

                if (to.y<from.y) {
                    var tmp = from;
                    from = to;
                    to = tmp;
                }
                if (from.y<yMin) yMin = from.y;
                if (to.y>yMax) yMax = to.y;

                var dx = to.x-from.x;
                var dy = to.y-from.y;

                var step = dy==0? 0 :dx/dy;

                if (et[from.y]==undefined) et[from.y]=[];
                et[from.y].push({yMax:to.y,xMin:from.x,step:step});
            });

            var aet = [];
            var y = yMin;

        var i;
        while (y!=yMax){
            if (et[y]!=undefined)
                aet = aet.concat(et[y]);

            aet.sort(function(a,b){return a.xMin<b.xMin});

            for (i=0;i<aet.length-1;i+=2){
                var a = aet[i];
                var b = aet[i+1];

                //ctx.strokeStyle = '#d3d3d3';
                //ctx.beginPath();
                //ctx.moveTo(Math.floor(a.xMin),y);
                //ctx.lineTo(Math.floor(b.xMin),y);
                //ctx.stroke();

                quick_bresenham({x:Math.floor(a.xMin),y:y},{x:Math.floor(b.xMin),y:y},ctx,'#000000');
            }

            for (i=aet.length-1;i>=0;i--){
                if (aet[i].yMax==y) aet.splice(i,1);
            }
            y++;
            aet.forEach(function(s){
               s.xMin+=s.step;
            });
        }
    }

    function aa_wu_line(from,to,ctx,color){
        var y = from.y;
        var x = from.x;

        var dx = Math.abs(to.x-from.x);
        var dy = Math.abs(to.y-from.y);
        var sy = to.y>from.y? 1 : -1;
        var sx = to.x>from.x? 1 : -1;

        var ya = dx==0? 0 : (to.y-from.y)/dx;
        var xa = dy==0? 0 : (to.x-from.x)/dy;

        var a1,a2;

        if (dx>dy){
            while(x!=to.x) {
                a1 = (1-(y-Math.floor(y)));
                a2 = 1-a1;
                ctx.globalAlpha = a1;
                ctx.setPixelXY(x,Math.floor(y),color);
                ctx.globalAlpha = a2;
                ctx.setPixelXY(x,Math.floor(y)+1,color);
                x+=sx;
                y+=ya;
            }
        } else {
            while(y!=to.y) {
                a1 = (1-(x-Math.floor(x)));
                a2 = 1-a1;
                ctx.globalAlpha = a1;
                ctx.setPixelXY(Math.floor(x),y,color);
                ctx.globalAlpha = a2;
                ctx.setPixelXY(Math.floor(x)+1,y,color);
                x+=xa;
                y+=sy;
            }
        }
        ctx.globalAlpha = 1;
    }


    function quick_bresenham(from,to,ctx,color){
        var dx = Math.abs(to.x-from.x);
        var dy = Math.abs(to.y-from.y);
        var sy = to.y>from.y? 1 : -1;
        var sx = to.x>from.x? 1 : -1;
        var x = from.x;
        var y = from.y;
        var dst = to.x;
        ctx.setPixelXY(x,y,color);
        var flip = false;
        if (dx<dy){
            dst = to.y;
            flip = true;
            [dx,dy] = [dy,dx];
            [x,y] = [y,x];
            [sx,sy] = [sy,sx];
            [CanvasRenderingContext2D.prototype.setPixelXY,CanvasRenderingContext2D.prototype.setPixelYX]
                = [CanvasRenderingContext2D.prototype.setPixelYX,CanvasRenderingContext2D.prototype.setPixelXY];
        }
        var n = -2*dx;
        var e = 2*dy;
        var d = e-dx;
        while (x!=dst){
            if (d>=0) {
                y+=sy;
                d+=n;
            }
            d+=e;
            x+=sx;

            //ctx.data[x+2000*y]=255<<24;
            ctx.setPixelXY(x,y,color);
        }
        if (flip)
            [CanvasRenderingContext2D.prototype.setPixelXY,CanvasRenderingContext2D.prototype.setPixelYX]
            = [CanvasRenderingContext2D.prototype.setPixelYX,CanvasRenderingContext2D.prototype.setPixelXY];
    }

    return {
        drawBresenhamLine : quick_bresenham,
        aaLine : aa_wu_line,
        fillPolygon : scan_line
    }
})();