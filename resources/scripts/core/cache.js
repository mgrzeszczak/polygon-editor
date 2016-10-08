app.cache = (function(){

    var dict = {};

    function getLine(a,b){
        var key = a.x+"_"+a.y+"_"+b.x+"_"+b.y;
        if (typeof dict[key] == "undefined") dict[key] = app.algorithms.bresenham(a,b);
        return dict[key];
    }

    return {
        getLine : getLine,
    }
})();