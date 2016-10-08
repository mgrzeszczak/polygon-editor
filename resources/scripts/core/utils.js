app.utils = (function(){

    function setImgPos(img,x,y){
        img.setAttribute("style","position:absolute;top:"+(y)+";left:"+(x)+";");
    };

    return {
        setImgPos : setImgPos
    }
})();