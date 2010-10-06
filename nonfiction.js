function background( paper, w, h){
  var bg = paper.rect( 0, 0, w, h);
  bg.attr("gradient", "270-#fcfcfc-#fcfcfc:40-#ddd");
  bg.attr("stroke", "none");
}
function slider( id, width, height, styles)
{
    var paper = Raphael( id, width + 20, height + 10);
    background( paper, width + 20, height + 10);
    var base = paper.rect( 10, height / 4 + 5, width, height - height / 2, 4);

    var nf = new Object();
    var north = new Object();
    var south = new Object();
    var border = new Object();
    north.color = (styles && style.north) ? style.north : '#c00';
    south.color = (styles && style.south) ? style.south : '#00c';
    border.color = (styles && style.border) ? style.border : '#500';
    border.width = (styles && style.borderwidth) ? style.borderwidth : 2;

    nf.width = width;
    nf.height = height;
    nf.north = north;
    nf.south = south;
    nf.border = border;
    nf.moveon = false;
    nf.value = 50;
    base.nonfiction = nf;

    base.attr({
      fill: '0-'+north.color+':'+nf.value+'-'+south.color+':'+nf.value,
      stroke: border.color,
      'stroke-width': border.width
    });
    var release = function(e){
      this.nonfiction.moveon = false;
      this.attr('stroke', this.nonfiction.border.color);
      this.nonfiction.prev = e.pageX;
    };
    base.mouseup(release);
    base.mouseout(release);
    base.map = function(x){
      var raw_x = x - $('#'+id).offset().left - 10;
      return raw_x / (this.nonfiction.width / 100);
    };

    var update = function(x, instance){
      instance.nonfiction.value = x;
      if(instance.nonfiction.value < 0)   instance.nonfiction.value = 0;
      if(instance.nonfiction.value > 100) instance.nonfiction.value = 100;
      instance.attr( 'fill', '0-'+instance.nonfiction.north.color+':'+instance.nonfiction.value+'-'+instance.nonfiction.south.color+':'+nf.value);
    };
    base.mousemove(function(e){
      if(this.nonfiction.moveon) update( this.map(e.pageX), this);
    });
    base.mousedown(function(e){
      this.nonfiction.moveon = true;
      base.attr('stroke', '#f00');
      update( this.map(e.pageX), this);
    });

}