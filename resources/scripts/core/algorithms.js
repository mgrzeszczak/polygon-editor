app.algorithms = (function(){

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