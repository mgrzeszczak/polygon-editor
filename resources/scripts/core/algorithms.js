app.algorithms = (function(){

    var lc = 0xffffffff;
    var _255_8 = 255<<8;
    var _255_16 = 255<<16;
    var _255_24 = 255<<24;
    var rev_255 = 1/255;
    var black = 255<<24;

    var normalVectorFunction = null;

    var revW = 1/window.innerWidth;
    var revH = 1/window.innerHeight;

    var lr = (lc&255)*rev_255;
    var lg = ((lc&(_255_8))>>8)*rev_255;
    var lb = ((lc&(_255_16))>>16)*rev_255;

    function setLightColor(color){
        lc = color;
        lr = (lc&255)*rev_255;
        lg = ((lc&(_255_8))>>8)*rev_255;
        lb = ((lc&(_255_16))>>16)*rev_255;
        //console.log(lr);
        //console.log(lg);
        //console.log(lb);
    }

    function putPixel(ctx,x,y,c){
        ctx.data[x+y*app.mwidth] = calculateColor(x,y,app.lx,app.ly,app.lz,lc);
    }

    function putPixelR(ctx,x,y,c){
        ctx.data[x*app.mwidth+y] = calculateColor(y,x,app.lx,app.ly,app.lz,lc);
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


    function calculateColor(x,y,lx,ly,lz,lc){
        // calculate vector to light
        var dx = lx-x;
        var dy = ly-y;
        var dz = lz;
        // normalize vector to light

        // length of vector to light
        var dl = Math.sqrt(dx*dx+dy*dy+dz*dz);
        //var inv = 1/Math.sqrt(dx*dx+dy*dy+dz*dz);
        //dx*=inv;
        //dy*=inv;
        //dz*=inv;

        // calculate object's normal vector
        var ox = 0;//((x<window.innerWidth/2?-1:1)*Math.abs(x-window.innerWidth/2));
        var oy = 0;//((y<window.innerHeight/2? -1:1)*Math.abs(y-window.innerHeight/2));
        var oz = 1;//window.innerWidth;
        // normalize it

        /*
        inv = 1/Math.sqrt(ox*ox+oy*oy+oz*oz);
        ox*=inv;
        oy*=inv;
        oz*=inv;
        */

        // calculate normalized position on the canvas
        //var nx = x*revW;
        //var ny = y*revH;
        // calculate position on the bump map
        //var hx = Math.floor(nx*app.hMapWidth);
        //var hy = Math.floor(ny*app.hMapHeight);
        var hx = Math.floor(x%app.hMapWidth);
        var hy = Math.floor(y%app.hMapHeight);
        // get bump map normal vector
        // add bump map's normal vector to object's normal vector and normalize the result
        var offset = 3*(hx+hy*app.hMapWidth);
        ox += app.hMap[offset];
        oy += app.hMap[offset+1];
        oz += app.hMap[offset+2];


        /*
        inv = 1/Math.sqrt(ox*ox+oy*oy+oz*oz);//invsqrt(ox*ox+oy*oy+oz*oz);
        ox*=inv;
        oy*=inv;
        oz*=inv;*/


        // calculate the cosine between normal vector and vector to the light
        // it is equal to the dot product of the aforementioned vectors
        var cos = (dx*ox+dy*oy+dz*oz)/(dl*Math.sqrt(ox*ox+oy*oy+oz*oz));
        if (cos<0) cos =0 ;
        // calculate the coordinates on the texture

        //var tx = x%app.texWidth;
        //var ty = y%app.texHeight;
        var tx = x%app.texWidth;
        var ty = y%app.texHeight;


        // get texture colors
        var value = app.texture[tx+ty*app.texWidth];
        var r = (value&255);//app.texture[4*tx+4*ty*app.texWidth]/255;
        var g = ((value&(_255_8))>>8);//app.texture[4*tx+4*ty*app.texWidth+1]/255;
        var b = ((value&(_255_16))>>16);//app.texture[4*tx+4*ty*app.texWidth+2]/255;
        // calculate light color components
        // precalculated
        // calculate the reflected light color
        return _255_24 | (b*lb*cos)<<16 | (g*lg*cos)<<8 | (cos*r*lr);
    }

    function scan_line(ctx,polygon){
        var edges = polygon.edges;

        var yMin = edges[0].from.y;
        var yMax = edges[0].from.y;
        var i,len;
        var et = {};

        //var lines = [];

        for (i=0,len=edges.length;i<len;i++){
            var edge = edges[i];
            var from = edge.from;
            var to = edge.to;

            if (to.y<from.y) {
                var tmp = from;
                from = to;
                to = tmp;
            }
            if (from.y<yMin) yMin = from.y;
            if (to.y>yMax) yMax = to.y;

            var dx = to.x-from.x;
            var dy = to.y-from.y;

            var step = dy==0? 0 : dx/dy;

            if (et[from.y]==undefined) et[from.y]=[];
            et[from.y].push({yMax:to.y,xMin:from.x,step:step});
        }

        var aet = [];
        var y = yMin;

        while (y!=yMax){
            if (et[y]!=undefined)
                aet = aet.concat(et[y]);

            aet.sort(function(a,b){return a.xMin<b.xMin});

            for (i=0,len=aet.length-1;i<len;i+=2){
                var a = aet[i];
                var b = aet[i+1];
                //fx,fy,tx,ty,ctx,color

                quick_bresenham2(Math.floor(a.xMin),y,Math.floor(b.xMin),y,ctx,black);
                //lines.push([Math.floor(a.xMin),Math.floor(b.xMin),y]);
            }

            var arr = [];
            for (i=aet.length-1;i>=0;i--){
                // TODO: efficiency
                if (aet[i].yMax==y) aet.splice(i,1);
                else if (aet[i].yMax==y+1) arr.push(aet[i]);
            }
            // TODO: efficiency
            aet = aet.concat(arr);

            y++;
            for (i=0,len=aet.length;i<len;i++){
                var s = aet[i];
                s.xMin+=s.step;
            }
        }

        //return lines;
    }

    function findIntersection(e1,e2){
        // e1.from = p
        // e2.from = q
        var p = new app.objects.vec2d(e1.from.x,e1.from.y);
        var q = new app.objects.vec2d(e2.from.x,e2.from.y);

        // e1.to = p+r
        // e2.to = q+s
        var r = new app.objects.vec2d(e1.to.x-p.x,e1.to.y-p.y);
        var s = new app.objects.vec2d(e2.to.x-q.x,e2.to.y-q.y);

        //u = (q − p) × r / (r × s)
        //t = (q − p) × s / (r × s)
        var rxs = r.cross(s);
        var qpxr = (q.add(p.reverse())).cross(r);

        //If r × s = 0 and (q − p) × r = 0, then the two lines are collinear.
        if (rxs==0 && qpxr==0){
            // colinear
            return { status:true };
        }
        //If r × s = 0 and (q − p) × r ≠ 0, then the two lines are parallel
        if (rxs==0 && qpxr!=0){
            // parallel
            return { status:false };
        }
        var u = qpxr/rxs;
        var t = (q.add(p.reverse())).cross(s)/rxs;
        //If r × s ≠ 0 and 0 ≤ t ≤ 1 and 0 ≤ u ≤ 1, the two line segments meet at the point p + t r = q + u s
        if (rxs!=0 && t>=0 && t<=1 && u>=0 && u<=1){
            return { status:true, v:app.factory.createVertex(Math.floor(p.x+t*r.x),Math.floor(p.y+t*r.y)) };
        }
        // else not parallel but not intersecting
        return {status:false};
    }

    // number of intersections should be equal to the amount of vertices
    function checkPolygonIntersections(poly){
        var edges = poly.edges;
        var count =0;
        for (var i=0,len=edges.length;i<len;i++){
            for (var j=i+1;j<len;j++){
                var ret = findIntersection(edges[i],edges[j]);
                if (ret.status==true){
                    count+=1;
                }
            }
        }
        return count==poly.vertices.length;
    }

    app.node = function(v,next){
        this.v = v;
        this.next = next;
    };

    function checkAndRotate(polygon){
        var sum = 0;
        polygon.edges.forEach(function(e){
            sum += (e.to.x-e.from.x)/(e.to.y+e.from.y);
        });
        if (sum>=0) {
            var vertices = polygon.vertices;
            var poly = new app.factory.createPolygon();
            for (var i=vertices.length-1;i>=0;i--){
                poly.addVertex(vertices[i]);
            }
            poly.close();
            polygon = poly;
        }
        return polygon;
    }

    function createVertexList(polygon,dict){
        var head = new app.node(polygon.vertices[0]);
        var prev = head;
        dict[prev.v.id]=prev;
        for (var i =1;i<polygon.vertices.length;i++){
            prev.next = new app.node(polygon.vertices[i]);
            prev = prev.next;
            dict[prev.v.id]=prev;
        }
        prev.next = head;
        return head;
    }

    function addIntersectionPointsToList(polygon,intersections,dict){
        for (var i=0,len=polygon.edges.length;i<len;i++){
            var e = polygon.edges[i];
            var intersectionPoints = intersections[e.id];
            if (intersectionPoints==undefined) continue;

            intersectionPoints.sort(function(a,b){
                return app.utils.distance(e.from,a)-app.utils.distance(e.from,b);
            });

            var from = e.from;
            var node = dict[from.id];
            var last = node.next;
            var prev = node;

            for (var j=0;j<intersectionPoints.length;j++){
                var v = intersectionPoints[j];
                prev.next = new app.node(v);
                prev = prev.next;
                dict[v.id]=prev;
            }
            prev.next = last;
        }
    }

    /********************************************
     *  POINT IN POLYGON PROBLEM (RAY CASTING SOLUTION)
     ********************************************/
    function isPointInPolygon(x,y,edges){
        function findNumberOfIntersections(e,edges){
            var number = 0;
            edges.forEach(function(edge){
               if (findIntersection(edge,e).status==true) number++;
            });
            return number;
        }
        var point = app.factory.createVertex(x,y);
        var pointN = app.factory.createVertex(x,0);
        var pointS = app.factory.createVertex(x,window.innerHeight);
        var pointW = app.factory.createVertex(0,y);
        var pointE = app.factory.createVertex(window.innerWidth,y);

        var segmentN = app.factory.createEdge(point,pointN);
        var segmentS = app.factory.createEdge(point,pointS);
        var segmentE = app.factory.createEdge(point,pointE);
        var segmentW = app.factory.createEdge(point,pointW);

        return !(findNumberOfIntersections(segmentN,edges)%2==0 &&
                findNumberOfIntersections(segmentS,edges)%2==0 &&
                findNumberOfIntersections(segmentE,edges)%2==0 &&
                findNumberOfIntersections(segmentW,edges)%2==0);
    }

    /********************************************
     *  WEILER-ATHERTON ALGORITHM IMPLEMENTATION
     ********************************************/
    function clipPolygons(polyA, polyB){
        // make sure polygons do not intersect themselves
        if (!checkPolygonIntersections(polyA)
        || !checkPolygonIntersections(polyB)) {
            alert('One or more polygons are invalid');
            return;
        }
        // remove polygons from object list
        app.removePoly(polyA);
        app.removePoly(polyB);
        // check is clockwise both;
        // if not reverse order
        polyA = checkAndRotate(polyA);
        polyB = checkAndRotate(polyB);

        // create one way lists for vertices of each polygon
        // with dictionaries that allow const time retrieval of any vertex in the list
        var dictA = {};
        var headA = createVertexList(polyA,dictA);
        var dictB = {};
        var headB = createVertexList(polyB,dictB);

        // find all intersection points and fill entrance point array
        var intersections = {}; // edge -> intersection point list dict
        var inside = isPointInPolygon(polyA.vertices[0].x,polyA.vertices[0].y,polyB.edges);
        var entrancePoints = [];


        for (var i=0,len=polyA.edges.length;i<len;i++){
            var e = polyA.edges[i];
            for (var j=0,len2=polyB.edges.length;j<len2;j++){
                var ret = findIntersection(e,polyB.edges[j]);
                if (ret.status==true) {
                    if (intersections[e.id]==undefined){
                        intersections[e.id]=[];
                    }
                    intersections[e.id].push(ret.v);
                    if (intersections[polyB.edges[j].id] == undefined){
                        intersections[polyB.edges[j].id] = [];
                    }
                    intersections[polyB.edges[j].id].push(ret.v);
                }
            }

            if (intersections[e.id]==undefined) continue;
            var intersectionPoints = intersections[e.id];
            intersectionPoints.sort(function(a,b){
                return app.utils.distance(e.from,a)-app.utils.distance(e.from,b);
            });

            for (var k=0;k<intersectionPoints.length;k++){
                intersectionPoints[k].entrance = !inside;
                if (!inside == true) entrancePoints.push(intersectionPoints[k]);
                inside = !inside;
            }
        }

        addIntersectionPointsToList(polyA,intersections,dictA);
        addIntersectionPointsToList(polyB,intersections,dictB);

        for (var i=0;i<entrancePoints.length;i++){
            entrancePoints[i].visited = false;
        }

        var rects = [];
        for (var i=0;i<entrancePoints.length;i++){
            if (entrancePoints[i].visited==true) continue;

            var firstEntrancePoint = entrancePoints[i];
            firstEntrancePoint.visited = true;
            var rect = [];

            // go within this polygon until exit point
            // switch polygons
            // on return to the first entrance point, stop
            rect.push(firstEntrancePoint);
            var node = dictA[firstEntrancePoint.id];
            node = node.next;

            while (node.v.id!=firstEntrancePoint.id){
                node.v.visited = true;
                rect.push(node.v.clone());
                if (node.v.entrance==false) node = dictB[node.v.id];
                else if (node.v.entrance == true) node = dictA[node.v.id];
                node = node.next;
            }
            rects.push(rect);
        }

        rects.forEach(function(r){
            if (r.length<3) return;
            var polygon = new app.factory.createPolygon();
            r.forEach(function(v){
                v.x = Math.floor(v.x);
                v.y = Math.floor(v.y);
                polygon.addVertex(v);
            });
            polygon.close();
            app.addPoly(polygon);
        });

        app.mode.setMode(app.modes.MOVE);
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

    function setNormalVectorFunction(f){
        normalVectorFunction = f;
    }

    return {
        drawBresenhamLine : quick_bresenham2,
        aaLine : aa_wu_line,
        fillPolygon : scan_line,
        weilerAtherton : clipPolygons,
        setLightColor : setLightColor,
        setNormalVectorFunction: setNormalVectorFunction,
    }
})();