app.utils = (function(){

    function clearImages(){
        $("img").remove();
    }

    function distance(a,b){
        var xDiff = a.x-b.x;
        var yDiff = a.y-b.y;
        return Math.round(Math.sqrt(xDiff*xDiff+yDiff*yDiff));
    }

    return {
        clearImages : clearImages,
        distance : distance
    }
})();


