app.algorithms = (function(){


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

    function bresenham(from,to){
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
        bresenham : bresenham
    }
})();