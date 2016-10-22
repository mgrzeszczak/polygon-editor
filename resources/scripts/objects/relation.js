app.relations = {
    VERTICAL : 1,
    HORIZONTAL : 2,
    LENGTH : 3,
    NULL : 4
};

app.relation = function(type,length){
    this.type = type;
    this.length = length;

    this.apply = function(edge,vertex){
        if (this.check(edge)) return;
        var from = vertex;
        var to = edge.to==vertex?edge.from : edge.to;
        switch (this.type){
            case app.relations.NULL:
                break;
            case app.relations.LENGTH:
                var dist = app.utils.distance(from,to);
                var vec = {x:(to.x-from.x)/dist,y:(to.y-from.y)/dist};
                vec.x *=this.length;
                vec.y *=this.length;
                //console.log([Math.round(from.x+vec.x),Math.round(from.y+vec.y)]);
                to.move(Math.round(from.x+vec.x),Math.round(from.y+vec.y));
                break;
            case app.relations.VERTICAL:
                to.move(from.x,to.y);
                //to.x = from.x;
                break;
            case app.relations.HORIZONTAL:
                to.move(to.x,from.y);
                //to.y = from.y;
                break;
        }
    };
    this.check = function(edge){
        switch (this.type){
            case app.relations.NULL:
                return true;
                break;
            case app.relations.LENGTH:
                return app.utils.distance(edge.from,edge.to)==this.length;
                break;
            case app.relations.VERTICAL:
                return edge.to.x == edge.from.x;
                break;
            case app.relations.HORIZONTAL:
                return edge.to.y == edge.from.y;
                break;
        }
    };

    this.getName = function(){
        switch (this.type){
            case app.relations.NULL:
                return "None";
                break;
            case app.relations.LENGTH:
                return "Length: "+this.length;
                break;
            case app.relations.VERTICAL:
                return "Vertical";
                break;
            case app.relations.HORIZONTAL:
                return "Horizontal";
                break;
        }
    };

    this.getColor = function(){
        switch (this.type){
            case app.relations.NULL:
                return {
                    hex : '#000000',
                    rgba: {r:0,g:0,b:0,a:255}
                };
            case app.relations.LENGTH:
                return {
                    hex: '#00FF00',
                    rgba: {r:0,g:255,b:0,a:255}};
            case app.relations.VERTICAL:
                return {
                    hex : '#FFFF00',
                    rgba: {r:255,g:255,b:0,a:255}};
            case app.relations.HORIZONTAL:
                return {
                    hex: '#0000FF',
                    rgba: {r:0,g:0,b:255,a:255}};
        }
    };
};