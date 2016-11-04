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

    function hexToColor(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return 255<<25 | parseInt(result[3], 16)<<16 | parseInt(result[2], 16) << 8 | parseInt(result[1], 16);
    }

    return {
        clearImages : clearImages,
        distance : distance,
        colorFromRGBA : colorFromRGBA,
        hexToColor : hexToColor
    }
})();


