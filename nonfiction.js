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
    base.mousedown(function(){
      this.nonfiction.moveon = true;
      base.attr('stroke', '#f00');
    });
    release = function(){
      this.nonfiction.moveon = false;
      base.attr('stroke', this.nonfiction.border.color);
    };
    base.mouseup(release);
    base.mouseout(release);
    base.mousemove(function(e){
      if(this.nonfiction.moveon){
        var dx;
        if( this.nonfiction.prev){ 
	  dx = e.pageX - this.nonfiction.prev;
	} else {
          dx = 0;
          this.nonfiction.prev = e.pageX;
	}
	this.nonfiction.value += dx;
	if(this.nonfiction.value < 0)   this.nonfiction.value = 0;
	if(this.nonfiction.value > 100) this.nonfiction.value = 100;
        this.attr( 'fill', '0-'+north.color+':'+this.nonfiction.value+'-'+south.color+':'+nf.value);
	this.nonfiction.prev = e.pageX;
      }
    });

}