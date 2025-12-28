// google-reviews.js
// Loads Google Maps JS API (Places library) and fetches place reviews to render on the page.
(function() {
  'use strict';

  function debug() {
    if (window.console && window.console.log) {
      console.log.apply(console, arguments);
    }
  }

  function renderReviews(reviews, reviewsListEl, moreLink) {
    reviewsListEl.innerHTML = ''; // clear
    if (!Array.isArray(reviews) || reviews.length === 0) {
      reviewsListEl.innerHTML = '<p class="text-muted py-4 text-center">Nemáme žiadne verejné recenzie.</p>';
      return;
    }

    var fragment = document.createDocumentFragment();
    var maxReviews = (window.GOOGLE_REVIEWS_CONFIG && window.GOOGLE_REVIEWS_CONFIG.maxReviews) ? Number(window.GOOGLE_REVIEWS_CONFIG.maxReviews) : 4;
    if (!maxReviews || maxReviews < 1) maxReviews = 4;
    reviews.slice(0, maxReviews).forEach(function(rev) {
      var col = document.createElement('div');
      col.className = 'col-lg-6 col-12';

      var card = document.createElement('div');
      card.className = 'google-review-card';

      var ratingDiv = document.createElement('div');
      ratingDiv.className = 'google-review-rating';
      var stars = '';
      var rating = Math.round(rev.rating || 0);
      for (var i = 0; i < rating; i++) { stars += '<i class="bi bi-star-fill"></i>'; }
      ratingDiv.innerHTML = stars;
      card.appendChild(ratingDiv);

      var txt = document.createElement('p');
      txt.className = 'google-review-text';
      txt.textContent = rev.text || '';
      card.appendChild(txt);

      var author = document.createElement('p');
      author.className = 'google-review-author';
      author.textContent = rev.author_name || '';
      card.appendChild(author);

      col.appendChild(card);
      fragment.appendChild(col);
    });

    reviewsListEl.appendChild(fragment);

    // Update more link to the place URL if provided
    if (moreLink && moreLink.href) {
      var btn = document.getElementById('google-reviews-more');
      if (btn) {
        btn.href = moreLink.href;
      }
    }
  }

  function formatPlaceUrl(placeId) {
    if (!placeId) return '#';
    return 'https://search.google.com/local/writereview?placeid=' + encodeURIComponent(placeId);
  }

  function onMapsApiReady(cfg) {
    if (!cfg || !cfg.placeId) {
      debug('Google reviews: configuration missing (placeId).');
      var reviewsListEl = document.getElementById('reviews-list');
      if (reviewsListEl) reviewsListEl.innerHTML = '<p class="text-muted py-4 text-center">Nepodarilo sa načítať konfiguráciu recenzií.</p>';
      return;
    }
    var placeId = cfg.placeId;
    var reviewsListEl = document.getElementById('reviews-list');
    if (!reviewsListEl) return;

    var mapDiv = document.createElement('div');
    mapDiv.style.display = 'none';
    document.body.appendChild(mapDiv);
    var map = new google.maps.Map(mapDiv);
    var service = new google.maps.places.PlacesService(map);

    service.getDetails({ placeId: placeId, fields: ['review', 'reviews', 'name', 'rating', 'url'] }, function(place, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        debug('Google reviews: place details error', status);
        reviewsListEl.innerHTML = '<p class="text-muted py-4 text-center">Nepodarilo sa načítať recenzie (status: ' + status + ').</p>';
        // if place exists, link to it
        var moreLink = document.getElementById('google-reviews-more');
        if (moreLink && cfg.placeId) { moreLink.href = formatPlaceUrl(cfg.placeId); }
        return;
      }

      var reviews = place.reviews || [];
      renderReviews(reviews, reviewsListEl, { href: place.url || formatPlaceUrl(cfg.placeId) });
    });
  }

  function fetchViaProxy(proxyBase, placeId) {
    if (!proxyBase) return Promise.reject(new Error('No proxy base URL'));
    var url = proxyBase.replace(/\/$/, '') + '/api/reviews' + (placeId ? ('?placeId=' + encodeURIComponent(placeId)) : '');
    return fetch(url, { method: 'GET' }).then(function(res) {
      if (!res.ok) throw new Error('Proxy fetch failed: ' + res.status);
      return res.json();
    }).then(function(json) {
      if (!json || !json.place) throw new Error('Invalid proxy response');
      return json;
    });
  }

  function loadMapsScript(apiKey, callbackName) {
    if (typeof apiKey !== 'string' || apiKey.indexOf('YOUR_') === 0) {
      debug('Google reviews: API key not set or is a placeholder.');
      var reviewsListEl = document.getElementById('reviews-list');
      if (reviewsListEl) reviewsListEl.innerHTML = '<p class="text-muted py-4 text-center">Nastavte prosím Google API kľúč pre zobrazenie recenzií.</p>';
      var btn = document.getElementById('google-reviews-more');
      if (btn && window.GOOGLE_REVIEWS_CONFIG && window.GOOGLE_REVIEWS_CONFIG.placeId) btn.href = formatPlaceUrl(window.GOOGLE_REVIEWS_CONFIG.placeId);
      return;
    }

    var existing = document.querySelector('script[data-google-reviews]');
    if (existing) {
      // script already injected; assume window.google is available later
      return;
    }

    var s = document.createElement('script');
    s.setAttribute('data-google-reviews', '1');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(apiKey) + '&libraries=places&callback=' + callbackName;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }

  function init() {
    var cfg = window.GOOGLE_REVIEWS_CONFIG || {};
    var apiKey = cfg.apiKey || 'YOUR_API_KEY';
    var proxy = (window.REVIEWS_PROXY && String(window.REVIEWS_PROXY).trim()) || '';

    window.initGoogleReviews = function() { onMapsApiReady(cfg); };

    // render fallback link immediately
    var moreLink = document.getElementById('google-reviews-more');
    if (moreLink && cfg.placeId) moreLink.href = formatPlaceUrl(cfg.placeId);
    // If proxy is configured, attempt to fetch via the proxy first
    if (proxy && cfg.placeId) {
      var reviewsListEl = document.getElementById('reviews-list');
      if (reviewsListEl) reviewsListEl.innerHTML = '<p class="text-muted py-4 text-center">Načítavam recenzie...</p>';
      fetchViaProxy(proxy, cfg.placeId).then(function(payload) {
        var place = payload.place || {};
        var reviews = place.reviews || place.review || [];
        renderReviews(reviews, document.getElementById('reviews-list'), { href: place.url || formatPlaceUrl(cfg.placeId) });
        // Update 'more' link to the place url if available
        if (moreLink && place.url) moreLink.href = place.url;
      }).catch(function(err) {
        console.warn('Proxy error, falling back to client-side:', err);
        // fallback to client-side approach
        if (apiKey && apiKey.indexOf('YOUR_') !== 0) {
          loadMapsScript(apiKey, 'initGoogleReviews');
        } else {
          var reviewsListEl2 = document.getElementById('reviews-list');
          if (reviewsListEl2) reviewsListEl2.innerHTML = '<p class="text-muted py-4 text-center">Recenzie nie sú dostupné (chyba proxy a nie je nastavený API kľúč).</p>';
        }
      });
      return;
    }

    // If no proxy or proxy not used, use client-side Maps API
    if (apiKey && apiKey.indexOf('YOUR_') !== 0) {
      loadMapsScript(apiKey, 'initGoogleReviews');
    } else {
      // no key provided; show fallback message
      var reviewsListEl3 = document.getElementById('reviews-list');
      if (reviewsListEl3) {
        reviewsListEl3.innerHTML = '<p class="text-muted py-4 text-center">Recenzie nie sú dostupné (Google API kľúč nie je nastavený).</p>';
      }
    }
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
