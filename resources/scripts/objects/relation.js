app.relations = {
    VERTICAL : 1,
    HORIZONTAL : 2,
    LENGTH : 3
};

app.relation = function(type,length){
    this.type = type;
    if (this.type==app.relations.LENGTH)
        this.length = length;
};