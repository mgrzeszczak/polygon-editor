app.algorithms = (function(){

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
            ctx.setPixelXY(x,y,color);
        }
        if (flip)
            [CanvasRenderingContext2D.prototype.setPixelXY,CanvasRenderingContext2D.prototype.setPixelYX]
            = [CanvasRenderingContext2D.prototype.setPixelYX,CanvasRenderingContext2D.prototype.setPixelXY];
    }

    function my_line(from,to){
        var p1 = {x:from.x,y:from.y};
        var p2 = {x:to.x,y:to.y};
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
        return points;
    }

    return {
        drawBresenhamLine : quick_bresenham,
        aaLine : aa_wu_line
    }
})();