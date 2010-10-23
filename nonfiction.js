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
  nfp(id).append('<input type="hidden" name="'+nfn(id)+'" id="'+nfn(id)+'" value="'+default_value+'" />');
}

function slider( id, width, height, default_value, styles)
{
    var paper = Raphael( id, width + 20, height + 10);
    nf_background( paper, width + 20, height + 10);
    var base = paper.rect( 10, height / 4 + 5, width, height / 2, height / 4);
 
    default_value = (default_value) ? default_value : 50;
    var nf = new Object();
    var north = new Object();
    var south = new Object();
    var border = new Object();
    north.color = (styles && styles.north) ? styles.north : '#f90';
    south.color = (styles && styles.south) ? styles.south : '#aaa';
    border.color = (styles && styles.border) ? styles.border : '#555';
    border.width = (styles && styles.borderwidth) ? styles.borderwidth : 2;
    border.light = (styles && styles.borderhighlight) ? styles.borderhighlight : '#a64';

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
      base.attr('stroke', this.nonfiction.border.light);
      update( this.map(e.pageX), this);
    });

    return paper;
}

Raphael.fn.polygon = function (params, points)
{
    // Initial parameter makes an effect... mysterious...
    var path_string = "M 100 100";
    for( var i = 0; i < points.length; i++){
      var x = points[i][0];
      var y = points[i][1];
      var s;
      s = (i == 0) ? "M " + x + " " + y + " " : "L " + x + " " + y + " ";
      if( i == points.length - 1) s += "L " + points[0][0] + " " + points[0][1] + " ";
      path_string += s;
    }
    var poly = this.path(path_string);
    poly.attr(params);

    return poly;
}

function lined_on( origin, base, bias)
{
  return origin + (base - origin) * bias;
};

function path_string( cx, cy, points, score)
{
  vertex = [];
  for( var i = 0; i < points.length; i++){
    var s = "";
    var x = lined_on( cx, points[i][0], score[i]);
    var y = lined_on( cy, points[i][1], score[i]);
    vertex.push( "" + x + " " + y);
  }
  return "M " + vertex.join("L ") + "L " + vertex[0];
};

function break_per( n, s)
{
  if( s.length <= n) return s;
  return s.slice(0,n) + "\n" + break_per( n, s.slice(n));
}

Raphael.fn.radarchart = function (x, y, radius, sides, params, score, labels, ids, max)
{
    // Saves a point of center
    var cx = x;
    var cy = y;

    // Genarates points of the chart frame
    var angle = 360;
    var edgeLength = 2 * radius * Math.sin(Math.PI / sides);
    x += edgeLength / 2;
    y += radius * Math.cos(Math.PI / sides);
    var points = [[x,y]];
    for(side = 1; side < sides; side++) {
        angle -= 360 / sides;
        rads = angle * (Math.PI / 180);
        x = x + edgeLength * Math.cos(rads);
        y = y + edgeLength * Math.sin(rads);
        points.push([x,y]);
    }

    // Regularises scores
    for( var i = 0; i < scores.length; i++){ scores[i] /= max}

    var st = this.set(); // A set to compose elements of a frame

    // Draws measures of the chart
    for( var i = 0; i < points.length; i++){
      var x = points[i][0];
      var y = points[i][1];
      st.push( this.path("M " + cx + " " + cy + " L " + x + " " + y).attr("stroke", "#777"));
    }

    // Draws chart
    var value = this.path( path_string( cx, cy, points, score));
    value.attr("fill","#f90");
    value.attr("fill-opacity","0.8");
    value.attr("stroke-width", "2");
    value.attr("stroke", "#a64");
    st.push(value);

    // Draws a frame of the chart and sets styles it
    var poly = this.polygon(params, points);
    poly.attr("stroke", "#555");
    poly.attr("stroke-width", "3");
    st.push(poly);

    var labelbars = new Array();
    if(labels){
      for( var i = 0; i < points.length; i++){
        var labelbar = this.set();
        var p = new Object();
        p.mx = lined_on( cx, points[i][0], 1.3);
        p.my = lined_on( cy, points[i][1], 1.3);
        p.lx = cx + radius * 1.7;
        p.ly = 30 + i * 30;
        p.marker = this.circle( p.mx, p.my, 7).attr({fill: '#fd7', stroke:'none'});
        var icon = this.circle( p.lx, p.ly, 5).attr({fill: '#f90', stroke:'none'});
        var text = this.text( p.lx + 10, p.ly, labels[i]).attr({fill:"#555"})
        text.translate( text.getBBox().width / 2, 0);
        var box = text.getBBox();
        var overlay = this.rect( p.lx - 10, p.ly - 10, box.width + 40, box.height + 10, 5).attr({stroke:'none', fill:'90-#ccc-#eee'}).toBack();
        var lbg = this.rect( p.lx - 10, p.ly - 10, box.width + 40, box.height + 10, 5).attr({stroke:'none', fill:'#fff', opacity:0.0});
        lbg.positions = p;
        lbg.show_link = function(){
          var p = this.positions;
          p.marker.animate({fill:'#f90'}, 200);
        };
        lbg.hide_link = function(){
          var p = this.positions;
          p.marker.animate({fill:'#fe9'}, 200);
        };
        lbg.mouseover(function(){this.show_link()}).mouseout(function(){this.hide_link()});
	labelbar.labelicon    = icon;
	labelbar.labelbg      = lbg;
	labelbar.labeltext    = text;
	labelbar.labeloverlay = overlay;
        labelbar.positions = p;
        labelbar.direction = function(){
          var p = this.positions;
          this.labelicon.animate({cx: p.mx, cy: p.my}, 200);
          this.labelbg.animate(     {x: p.mx - 10, y: p.my - 10}, 200);
          this.labeloverlay.animate({x: p.mx - 10, y: p.my - 10}, 200);
          this.labeltext.animate({x: p.mx + 10 + this.labeltext.getBBox().width / 2, y: p.my}, 200);
        };
        labelbar.dedirection = function(){
          var p = this.positions;
          this.labelicon.animate({cx: p.lx, cy: p.ly}, 200);
          this.labelbg.animate(     {x: p.lx - 10, y: p.ly - 10}, 200);
          this.labeloverlay.animate({x: p.lx - 10, y: p.ly - 10}, 200);
          this.labeltext.animate({x: p.lx + 10 + this.labeltext.getBBox().width / 2, y: p.ly}, 200);
        };
        labelbars.push( labelbar);
      }
    }

    if(ids){
      for( var i = 0; i < points.length; i++){
        var s = "";
        for( var j = 1; j < 6; j++){
          var x = lined_on( cx, points[i][0], j * 0.2);
          var y = lined_on( cy, points[i][1], j * 0.2);
          var cl = this.circle(x,y,3.5).attr({'fill':'#888','stroke':'none'}).mousedown(
            function(){
              score[this.axis] = this.score;
              $('#' + this.related_id).val(this.score * max);
              value.animate({path: path_string( cx, cy, points, score)}, 200, 'elastic');
            }
          ).mouseover(
            function(){
              this.animate({r: 5}, 150);
            }
          ).mouseout(
            function(){
              this.animate({r: 3.5}, 150);
            }
          ).mouseup(
            function(){
              this.animate({fill:"#888"}, 150);;
            }
          );
          cl.axis = i;
          cl.score = j / 5.0;
          cl.related_id = ids ? ids[i] : null;
          st.push(cl);
        }
      }
    }
    st.direction = function(){
      for( var i = 0; i < labelbars.length; i++){
        var lb = labelbars[i];
        var p = lb.positions;
        p.marker.animate({opacity:0}, 200);
        lb.direction();
      }
    };
    st.dedirection = function(){
      for( var i = 0; i < labelbars.length; i++){
        var lb = labelbars[i];
        var p = lb.positions;
        p.marker.animate({opacity:100}, 200);
        lb.dedirection();
      }
    };
    return st;
}

function radar( id, w, h, score, labels, ids, max)
{

  var center_x = w / 2;
  var center_y = h / 2;
  var shorter  = (w < h) ? w : h;
  var r = shorter / Math.PI;
  var n = score.length;

  var paper = Raphael( id, w + 200, h);
  var bg    = paper.rect(0, 0, w + 200, h, 0);
  var chart = paper.radarchart( center_x, center_y, r, n, {}, score, labels, ids, max);
  chart.rotate(0, center_x, center_y);

  paper.circle( w + 140, h - 30, 10).attr({stroke: 'none', fill: '#f90'}).click(chart.direction).mousedown(function(){ this.translate(2,2)}).mouseup(function(){ this.translate(-2,-2)}).hover(function(){this.animate({fill:'#fb8'},200)}, function(){this.animate({fill:'#f90'},200)});
  paper.circle( w + 170, h - 30, 10).attr({stroke: 'none', fill: '#a64'}).click(chart.dedirection).mousedown(function(){ this.translate(2,2)}).mouseup(function(){ this.translate(-2,-2)}).hover(function(){this.animate({fill:'#d97'},200)}, function(){this.animate({fill:'#a64'},200)});

  bg.attr("gradient", "270-#fff-#fff:40-#ddd");
  bg.attr("stroke", "none").toBack();
}

function barchart( id, width, height, n)
{
    var paper = Raphael( id, width, height);
    nf_background( paper, width, height); 
 
//    var base = paper.rect( 10, height / 4 + 5, width, height / 2, height / 4);
    var bars = new Array();
    var barWidth = width / n;
    for( var i = 0; i < n; i++){
      var bar = paper.rect( i * barWidth, 0, barWidth, height).attr({fill:'270-#f90-#a64', stroke:'none'}).click(function(){
        var newHeight = this.getBBox().height / 2;
        this.animate({height: newHeight, y: height - newHeight}, 200);
      });
    }
}