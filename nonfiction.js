function nf_background( paper, w, h)
{
  var bg = paper.rect( 0, 0, w, h);
  bg.attr("gradient", "270-#fcfcfc-#fcfcfc:40-#ddd");
  bg.attr("stroke", "none");
}
function nfn(id){ return 'nf_' + id; }
function nfo(id){ return $('#'+nfn(id)); }
function nfp(id){ return $('#'+id); }
function nf_addfield(id, default_value)
{
  nfp(id).append('<input type="text" name="'+nfn(id)+'" id="'+nfn(id)+'" value="'+default_value+'" />');
}
function slider( id, width, height, default_value, styles)
{
    var paper = Raphael( id, width + 20, height + 10);
    nf_background( paper, width + 20, height + 10);
    var base = paper.rect( 10, height / 4 + 5, width, height - height / 2, 4);
 
    default_value = (default_value) ? default_value : 50;
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
    nf.value = default_value;
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
    nfp(id).mouseout(release);
    base.map = function(x){
      var raw_x = x - $('#'+id).offset().left - 10;
      return raw_x / (this.nonfiction.width / 100);
    };
    nf_addfield(id, default_value);
    var update = function(x, instance){
      instance.nonfiction.value = Math.round(x);
      if(instance.nonfiction.value < 0)   instance.nonfiction.value = 0;
      if(instance.nonfiction.value > 100) instance.nonfiction.value = 100;
      instance.attr( 'fill', '0-'+instance.nonfiction.north.color+':'+instance.nonfiction.value+'-'+instance.nonfiction.south.color+':'+nf.value);
      nfo(id).val(instance.nonfiction.value);
    };
    base.mousemove(function(e){
      if(this.nonfiction.moveon) update( this.map(e.pageX), this);
    });
    base.mousedown(function(e){
      this.nonfiction.moveon = true;
      base.attr('stroke', '#f00');
      update( this.map(e.pageX), this);
    });

    return paper;
}