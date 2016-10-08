app.modes = {
    CREATE : 1,
    EDIT : 2,
    MOVE : 3
};

app.mode = (function(){

    var mode = null;

    function getMode(){
        return mode;
    }

    function setMode(newMode){
        if (newMode==mode) return;
        app.utils.clearImages();
        if (mode==app.modes.CREATE) app.finishPoly();
        mode = newMode;
        switch (mode){
            case app.modes.CREATE:
                app.enterCreateMode();
                break;
            case app.modes.EDIT:
                app.enterEditMode();
                break;
            case app.modes.MOVE:
                app.enterMoveMode();
                break;
        }
    }

    return {
        getMode : getMode,
        setMode : setMode
    }
})();