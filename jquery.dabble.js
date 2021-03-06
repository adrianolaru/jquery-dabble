/*!
 * Dabble
 * Copyright(c) 2012 Adrian Olaru <agolaru@gmail.com>
 * MIT Licensed
 */

(function($){

  var canvas = document.createElement('canvas')
    , ctx = canvas.getContext('2d');

  $.dabble = function(el, options) {
    this.$el = el;
    this.el = el[0];
    this.options = $.extend({}, $.dabble.defaults, options);
    var pixels = this.generate(this.process());
    this.$el.replaceWith(pixels);
    this.render();
  };

  $.dabble.VERSION = '0.1.0';

  $.dabble.prototype = {
    constructor: $.dabble,

    generate: function(config) {
      var colors = config.colors
        , pixel = config.pixel
        , width = config.width
        , height = config.height
        , l = colors.length
        , html = [];
      
      for (var i=0; i<l; i++) {
        html.push('<div class="dabble-pixel" style="'
          + 'background-color:' + colors[i] 
          + '; width: '+ pixel.width + 'px'
          + '; height: '+ pixel.height + 'px'
          + ';" data-color="' + colors[i] 
          + '"></div>');
      }

      return '<div class="dabble" style="'
        + 'width: ' + width + 'px; height: '+ height + 'px;">'
        +  html.join('') 
        + '</div>';
    },

    process: function() {
      var cols, rows, ratio, colors
        , cell = this.options.cell
        , scale = this.options.scale
        , lim = this.options.maxWidth
        , big = 'width'
        , small = 'height'
        , img = this.el;
    
      if (img.height > img.width) {
        big = 'height';
        small = 'width';
      }

      lim = img[big] > lim ? lim : img[big];
      ratio = img[big]/lim;
      img[big] = lim;
      img[small] = img[small]/ratio;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);

      cols = Math.round(canvas.width/cell.width);
      rows = Math.round(canvas.height/cell.height);

      return { 
          pixel: { width: cell.width*scale, height: cell.height*scale }
        , width: cols*cell.width*scale+1
        , height: rows*cell.height*scale+1
        , colors: this.pixelate(rows, cols, cell) 
      };
    },

    pixelate: function(rows, cols, cell) {
      var rgba, red, green, blue, alpha, row, col, x, y
        , shift = Array.prototype.shift
        , colors = [];

      for(row=0; row<rows; row++) {
        for(col=0; col<cols; col++) {
          x = col * cell.width;
          y = row * cell.height;
          rgba = ctx.getImageData(x, y, 1, 1).data;
          red = shift.call(rgba);
          green = shift.call(rgba);
          blue = shift.call(rgba);
          alpha = shift.call(rgba);
          colors.push('rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')');
        }
      }
      return colors; 
    },

    render: function() {
      $('.dabble .dabble-pixel').hover(function() {
        $(this).css({
            '-webkit-transition': 'none'
          , '-moz-transition':    'none'
          , '-o-transition':      'none'
          , 'transition':         'none'
          , 'background-color':   '#888'
      });
      }, function() {
        var $el = $(this)
          , color = $el.data('color');
        $el.css({
            '-webkit-transition': 'background-color 5s ease-out'
          , '-moz-transition':    'background-color 5s ease-out'
          , '-o-transition':      'background-color 5s ease-out'
          , 'transition':         'background-color 5s ease-out'
          , 'background-color':   color
        });
      });
    }
  };

  $.dabble.defaults = {
    cell: {width: 40, height: 40},
    scale: 1,
    maxWidth: 800
  };

  $.fn.dabble = function(options) {
    return this.each(function() {
      var $el = $(this), img = document.createElement('img');
      if (!$el.is('img')) return;
      img.src = $el.attr('src');
      $(img).load(function() {
        new $.dabble($el, options);
      });
    });
  };
})(jQuery);