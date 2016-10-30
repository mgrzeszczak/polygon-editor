app.algorithms = (function(){

    var lightColor = 0xffffffff;

    function putPixel(ctx,x,y,c){
        ctx.data[x+y*app.mwidth] = calculateColor(x,y,app.lx,app.ly,app.lz,lightColor,0);
    }

    function putPixelR(ctx,x,y,c){
        ctx.data[x*app.mwidth+y] = calculateColor(y,x,app.lx,app.ly,app.lz,lightColor,0);
    }

    var buf = new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT);
    var fv = new Float32Array(buf);
    var lv = new Uint32Array(buf);
    var threehalfs = 1.5;

    function invsqrt(number) {
        var x2 = number * 0.5;
        fv[0] = number;
        lv[0] = 0x5f3759df - ( lv[0] >> 1 );
        var y = fv[0];
        y = y * ( threehalfs - ( x2 * y * y ) );
        return y;
    }

    function calculateColor(x,y,lx,ly,lz,lc,oc){
        // calculate vector to light
        var dx = lx-x;
        var dy = ly-y;
        var dz = lz;
        // normalize vector to light
        var inv = 1/Math.sqrt(dx*dx+dy*dy+dz*dz);
        dx*=inv;
        dy*=inv;
        dz*=inv;
        // calculate object's normal vector
        var ox = 0;
        var oy = 0;
        var oz = 1;
        // normalize it
        inv = 1/Math.sqrt(ox*ox+oy*oy+oz*oz);
        ox*=inv;
        oy*=inv;
        oz*=inv;
        // calcualte normalized position on the canvas
        var nx = x/window.innerWidth;
        var ny = y/window.innerHeight;
        // calcualte position on the bump map
        var hx = Math.floor(nx*app.hMapWidth);
        var hy = Math.floor(ny*app.hMapHeight);
        // get bump map normal vector
        var hmapNormalX = app.hMap[3*hx+3*hy*app.hMapWidth];
        var hmapNormalY = app.hMap[3*hx+3*hy*app.hMapWidth+1];
        var hmapNormalZ = app.hMap[3*hx+3*hy*app.hMapWidth+2];


        /*
        var sx = app.hmap[4*(tx<app.hwidth-1?tx+1:tx)+4*ty*app.hwidth] - app.hmap[(tx==0? tx : tx-1)*4 + 4*ty*app.hwidth];
        if (tx == 0 || tx == app.hwidth-1)
            sx *= 2;
        var sy = app.hmap[4*tx+4*app.hwidth*(ty<app.hheight-1?ty+1:ty)] - app.hmap[4*tx+4*app.hwidth*(ty==0?ty:ty-1)];
        if (ty == 0 || ty == app.hheight -1)
            sy *= 2;
        hmapNormalX = -sx/255;
        hmapNormalY = -sy/255;
        hmapNormalZ = 2;
        inv = 1/Math.sqrt(hmapNormalX*hmapNormalX+hmapNormalY*hmapNormalY+hmapNormalZ*hmapNormalZ);//invsqrt(ox*ox+oy*oy+oz*oz);
        hmapNormalX*=inv;
        hmapNormalY*=inv;
        hmapNormalZ*=inv;
        //normal[y*width+x].set(-sx*yScale, 2*xzScale, sy*yScale);
         */

        // add bump map's normal vector to object's normal vector and normalize the result
        ox += hmapNormalX;
        oy += hmapNormalY;
        oz += hmapNormalZ;
        inv = 1/Math.sqrt(ox*ox+oy*oy+oz*oz);//invsqrt(ox*ox+oy*oy+oz*oz);
        ox*=inv;
        oy*=inv;
        oz*=inv;
        // calculate the cosine between normal vector and vector to the light
        // it is equal to the dot product of the aforementioned vectors
        var cos = dx*ox+dy*oy+dz*oz;
        if (cos<0) cos =0 ;
        // calculate the coordinates on the texture
        var tx = x%app.texWidth;
        var ty = y%app.texHeight;
        // get texture colors
        var r = app.texture[4*tx+4*ty*app.texWidth]/255;
        var g = app.texture[4*tx+4*ty*app.texWidth+1]/255;
        var b = app.texture[4*tx+4*ty*app.texWidth+2]/255;
        // calculate light color components
        var lr = (lc&255)/255;
        var lg = ((lc&(255<<8))>>8)/255;
        var lb = ((lc&(255<<16))>>16)/255;
        // calculate the reflected light color
        return 255<<24 | (b*lb*cos*255)<<16 | (g*lg*cos*255)<<8 | (cos*r*lr*255);
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
        var black = 255<<24;
        while (y!=yMax){
            if (et[y]!=undefined)
                aet = aet.concat(et[y]);

            aet.sort(function(a,b){return a.xMin>b.xMin});

            for (i=0;i<aet.length-1;i+=2){
                var a = aet[i];
                var b = aet[i+1];

                //if (a.xMin == b.xMin)
                    //console.log(a.xMin +' '+b.xMin);

                quick_bresenham({x:Math.floor(a.xMin),y:y},{x:Math.floor(b.xMin),y:y},ctx,black);
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

    function quick_bresenham2(fx,fy,tx,ty,ctx,color){
        var sy = 1;
        var sx = 1;
        var dx = tx-fx;
         if (dx<0) {
             dx=-dx;
             sx = -1;
         }
         var dy = ty-fy;
         if (dy<0) {
             dy=-dy;
             sy = -1;
         }
        var pixel = putPixel;

        if (dx<dy){
            var tmp;
            tmp = tx;
            tx = ty;
            ty = tmp;
            tmp = dx;
            dx = dy;
            dy = tmp;
            tmp = fx;
            fx = fy;
            fy = tmp;
            tmp = sx;
            sx = sy;
            sy = tmp;
            pixel = putPixelR;
        }
        pixel(ctx,fx,fy,color);
        var n = -(dx<<1);
        var e = dy<<1;
        var d = e-dx;
        while (fx!=tx){
            if (d>=0) {
                fy+=sy;
                d+=n;
            }
            d+=e;
            fx+=sx;
            pixel(ctx,fx,fy,color);
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
        drawBresenhamLine : quick_bresenham2,
        aaLine : aa_wu_line,
        fillPolygon : scan_line
    }
})();