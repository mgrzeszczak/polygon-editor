app.callbacks = (function(){

    function onResize() {
        app.content.canvas.width = window.innerWidth;
        app.content.canvas.height = window.innerHeight;
    }

    function onMouseMove(e){
        var pos = {x:e.clientX,y:e.clientY};
    }

    function onMouseDown(e){
        switch (app.mode.getMode()){
            case app.modes.CREATE:
                var vertex = {x:e.clientX,y:e.clientY};
                app.pushVertex(vertex);
                break;
        }
    }

    function onKeyDown(e){
        switch (e.key){
            case "e":
                app.mode.setMode(app.modes.EDIT);
                break;
            case "c":
                app.mode.setMode(app.modes.CREATE);
                break;
            case "m":
                app.mode.setMode(app.modes.MOVE);
                break;
            case "Escape":
                if (app.mode.getMode()==app.modes.CREATE) app.finishPoly();
                break;
            case "ArrowLeft":
                app.lx -=10;
                break;
            case "ArrowRight":
                app.lx +=10;
                break;
            case "ArrowUp":
                app.ly -=10;
                break;
            case "ArrowDown":
                app.ly +=10;
                break;
            case "Shift":
                app.lz +=10;
                break;
            case "Control":
                app.lz -=10;
                break;
        }
    }

    return {
        onResize : onResize,
        onMouseDown : onMouseDown,
        onKeyDown : onKeyDown,
        onMouseMove : onMouseMove
    }

})();