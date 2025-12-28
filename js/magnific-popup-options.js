$(document).ready(function() {
  // MagnificPopup
  var magnifPopup = function() {
    $('.image-popup').magnificPopup({
      type: 'image',
      removalDelay: 300,
      mainClass: 'mfp-with-zoom',
      gallery:{
        enabled:true
      },
      zoom: {
        enabled: true, // By default it's false, so don't forget to enable it

        duration: 300, // duration of the effect, in milliseconds
        easing: 'ease-in-out', // CSS transition easing function

        // The "opener" function should return the element from which popup will be zoomed in
        // and to which popup will be scaled down
        // By defailt it looks for an image tag:
        opener: function(openerElement) {
        // openerElement is the element on which popup was initialized, in this case its <a> tag
        // you don't need to add "opener" option if this code matches your needs, it's defailt one.
        return openerElement.is('img') ? openerElement : openerElement.find('img');
        }
      }
    });
    // Vimeo/Google Maps popup (generic iframe)
    $('.popup-vimeo, .popup-gmaps').magnificPopup({
      disableOn: 0,
      type: 'iframe',
      mainClass: 'mfp-fade',
      removalDelay: 160,
      preloader: false,
      fixedContentPos: false
      ,callbacks: {
        open: function() {
          var self = this;
          var $iframe = self.content && self.content.find('iframe');
          if (!$iframe || $iframe.length === 0) return;
          var timer = setTimeout(function() {
            // Fallback: open in new tab if iframe doesn't finish loading
            var src = $iframe.attr('src') || (self.currItem && self.currItem.src);
            if (src) {
              window.open(src, '_blank', 'noopener');
              self.close();
            }
          }, 5000);
          $iframe.on('load', function() { clearTimeout(timer); });
          self._mfpIframeTimer = timer;
        },
        close: function() { if (this._mfpIframeTimer) { clearTimeout(this._mfpIframeTimer); this._mfpIframeTimer = null; } }
      }
    });
      // YouTube popups (use enablejsapi to detect embedding errors)
      // Removed YouTube iframe popup logic per user request

        // Inline video popup removed; using YouTube iframe popup instead.
    // YouTube popup logic removed per user's request
  };
  
  // Call the functions 
  magnifPopup();

});