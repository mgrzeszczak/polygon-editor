app.algorithms = (function(){

    // has 1 floating point arithmetic
    function efficient_bresenham(from,to){
        var x0 = from.x;
        var y0 = from.y;
        var x1 = to.x;
        var y1 = to.y;

        var dx = Math.abs(x1-x0);
        var dy = Math.abs(y1-y0);
        var sx = (x0 < x1) ? 1 : -1;
        var sy = (y0 < y1) ? 1 : -1;
        var err = dx-dy;

        var points = [];
        while(x0!=x1 || y0!=y1){
            points.push({x:x0,y:y0});
            var e2 = err<<1;
            if (e2 >-dy){ err -= dy; x0  += sx; }
            if (e2 < dx){ err += dx; y0  += sy; }
        }
        return points;
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

        var c = {r:color.r,g:color.g,b:color.b,a:255};

        if (dx>dy){
            while(x!=to.x) {
                var a1 = 255*(1-(y-Math.floor(y)));
                var a2 = 255-a1;
                c.a = Math.floor(a1);
                ctx.setPixelXY(x,Math.floor(y),c);
                c.a = Math.floor(a2);
                ctx.setPixelXY(x,Math.floor(y)+1,c);
                x+=sx;
                y+=ya;
            }
        } else {
            while(y!=to.y) {
                var a1 = 255*(1-(x-Math.floor(x)));
                var a2 = 255-a1;
                c.a = Math.floor(a1);
                ctx.setPixelXY(Math.floor(x),y,c);
                c.a = Math.floor(a2);
                ctx.setPixelXY(Math.floor(x)+1,y,c);
                x+=xa;
                y+=sy;
            }
        }
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
            ctx.setPixelXY(flip?y:x,flip?x:y,color);
        }
        /*if (dx>dy){
            n = -2*dx;
            e = 2*dy;
            d = e-dx;
            while (x!=to.x){
                if (d>=0) {
                    y+=sy;
                    d+=n;
                }
                d+=e;
                x+=sx;
                ctx.setPixelXY(x,y,color);
            }
        }
        else {
            n = -2*dy;
            e = 2*dx;
            d = e-dy;
            while (y!=to.y){
                if (d>=0) {
                    x+=sx;
                    d+=n;
                }
                d+=e;
                y+=sy;
                ctx.setPixelXY(x,y,color);
            }
        }*/
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