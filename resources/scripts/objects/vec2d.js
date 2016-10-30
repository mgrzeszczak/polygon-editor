app.objects.vec2d = function(x,y){

    this.x = x;
    this.y = y;

    this.add = function(v){
        return new app.objects.vec2d(this.x+v.x,this.y+v.y);
    };

    this.reverse = function(){
      return new app.objects.vec2d(-this.x,-this.y);
    };

    this.multiply = function(c){
        return new app.objects.vec2d(this.x*c,this.y*c);
    };

    this.cross = function(v){
        return this.x*v.y-v.x*this.y;
    };

    this.dot = function(v){
        return this.x*v.x+this.y*v.y;
    };

    this.clone = function(){
      return new app.objects.vec2d(this.x,this.y);
    };

};
