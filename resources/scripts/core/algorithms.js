app.algorithms = (function(){

    function putPixel(ctx,x,y,c){
        //if (x<0 || x>app.mwidth || y<0 || y>app.mheight) return;
        ctx.data[x+y*app.mwidth] = c.a<<24 | c.r<<16 | c.g<<8 | c.b;
    }
    function putPixelR(ctx,x,y,c){
        //if (x<0 || x>app.mwidth || y<0 || y>app.mheight) return;
        ctx.data[x*app.mwidth+y] = c.a<<24 | c.r<<16 | c.g<<8 | c.b;
    }

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
        var colorBlack = {r:0,g:0,b:0,a:255};
        while (y!=yMax){
            if (et[y]!=undefined)
                aet = aet.concat(et[y]);

            aet.sort(function(a,b){return a.xMin<b.xMin});

            for (i=0;i<aet.length-1;i+=2){
                var a = aet[i];
                var b = aet[i+1];

                quick_bresenham({x:Math.floor(a.xMin),y:y},{x:Math.floor(b.xMin),y:y},ctx,colorBlack);
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
                putPixel(ctx,x,Math.floor(y),color);
                ctx.globalAlpha = a2;
                putPixel(ctx,x,Math.floor(y)+1,color);
                x+=sx;
                y+=ya;
            }
        } else {
            while(y!=to.y) {
                a1 = (1-(x-Math.floor(x)));
                a2 = 1-a1;
                ctx.globalAlpha = a1;
                putPixel(ctx,Math.floor(x),y,color);
                ctx.globalAlpha = a2;
                putPixel(ctx,Math.floor(x)+1,y,color);
                x+=xa;
                y+=sy;
            }
        }
        ctx.globalAlpha = 1;
    }

/*
    void SymmetricLine(int x1, int y1, int x2, int y2)
    {
        int dx = x2 - x1;
        int dy = y2 - y1;
        int incrE = 2*dy;
        int incrNE = 2*(dy - dx);
        int d = 2*dy - dx;
        int xf=x1;
        int yf=y1;
        int xb=x2;
        int yb=y2;
        putpixel(xf,yf);
        putpixel(xb,yb);
        while (xf<xb)
        {
            xf++;
            xb--;
            if (d<0) //Choose E and W
                d+=incrE;
            else //Choose NE and SW
            {
                d+=incrNE;
                yf++;
                yb--;
            }
            putpixel(xf,yf);
            putpixel(xb,yb);
        }
    }*/

    function symmetric_bresenham(from,to,ctx,color){
        var dx = Math.abs(to.x-from.x);
        var dy = Math.abs(to.y-from.y);

        var sy = 1;
        if (to.y<from.y) sy = -1;
        var sx = 1;
        if (from.x>to.x) sx = -1;
        //var sy = to.y>from.y? 1 : -1;
        //var sx = to.x>from.x? 1 : -1;

        var x = from.x;
        var y = from.y;

        var xb = to.x;
        var yb = to.y;

        var dst = to.x;

        var pixel = putPixel;
        pixel(ctx,x,y,color);
        pixel(ctx,xb,yb,color);
        if (dx<dy){
            dst = to.y;
            var tmp;
            tmp = dx;
            dx = dy;
            dy = tmp;
            tmp = x;
            x = y;
            y = tmp;
            tmp = xb;
            xb = yb;
            yb = tmp;
            tmp = sx;
            sx = sy;
            sy = tmp;
            pixel = putPixelR;
        }
        var n = -(dx<<1);
        var e = dy<<1;
        var d = e-dx;
        while (x<xb){
            if (d>=0) {
                y+=sy;
                yb-=sy;
                d+=n;
            }
            d+=e;
            x+=sx;
            xb-=sx;
            pixel(ctx,x,y,color);
            pixel(ctx,xb,yb,color);
        }
    }

    function quick_bresenham(from,to,ctx,color){
        var dx = Math.abs(to.x-from.x);
        var dy = Math.abs(to.y-from.y);

        /*var dx = to.x-from.x;
        if (dx<0) dx=-dx;
        var dy = to.y-from.y;
        if (dy<0) dy=-dy;*/

        var sy = 1;
        if (to.y<from.y) sy = -1;
        var sx = 1;
        if (from.x>to.x) sx = -1;
        //var sy = to.y>from.y? 1 : -1;
        //var sx = to.x>from.x? 1 : -1;
        var x = from.x;
        var y = from.y;
        var dst = to.x;
        var pixel = putPixel;
        pixel(ctx,x,y,color);
        if (dx<dy){
            dst = to.y;
            var tmp;
            tmp = dx;
            dx = dy;
            dy = tmp;
            tmp = x;
            x = y;
            y = tmp;
            tmp = sx;
            sx = sy;
            sy = tmp;
            pixel = putPixelR;
        }
        var n = -(dx<<1);
        var e = dy<<1;
        var d = e-dx;
        while (x!=dst){
            if (d>=0) {
                y+=sy;
                d+=n;
            }
            d+=e;
            x+=sx;
            pixel(ctx,x,y,color);
        }
    }

    return {
        drawBresenhamLine : quick_bresenham,
        aaLine : aa_wu_line,
        fillPolygon : scan_line
    }
})();