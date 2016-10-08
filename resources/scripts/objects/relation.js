app.relations = {
    VERTICAL : 1,
    HORIZONTAL : 2,
    LENGTH : 3,
    NULL : 4
};

app.relation = function(type,length){
    this.type = type;
    this.length = length;

    this.apply = function(edge){
        switch (this.type){
            case app.relations.NULL:
                break;
            case app.relations.LENGTH:
                var dist = app.utils.distance(edge.from,edge.to);
                var vec = {x:(edge.to.x-edge.from.x)/dist,y:(edge.to.y-edge.from.y)/dist};
                vec.x *=this.length;
                vec.y *=this.length;
                edge.to.x = Math.round(edge.from.x+vec.x);
                edge.to.y = Math.round(edge.from.y+vec.y);
                break;
            case app.relations.VERTICAL:
                edge.to.x = edge.from.x;
                break;
            case app.relations.HORIZONTAL:
                edge.to.y = edge.from.y;
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
};