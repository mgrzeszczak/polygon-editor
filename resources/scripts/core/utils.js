app.utils = (function(){

    function clearImages(){
        $("img").remove();
    }

    function distance(a,b){
        var xDiff = a.x-b.x;
        var yDiff = a.y-b.y;
        return Math.floor(Math.sqrt(xDiff*xDiff+yDiff*yDiff));
    }

    function colorFromRGBA(r,g,b,a){
        return a<<24 | r<<16 | g<<8 | b;
    }

    return {
        clearImages : clearImages,
        distance : distance,
        colorFromRGBA : colorFromRGBA
    }
})();


