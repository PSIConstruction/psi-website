/**
 * PSI Construction — lead capture + tracking
 * ------------------------------------------
 * Loaded from every page, just before </body>:
 *
 *     <script src="js/psi-tracking.js"></script>
 *
 * quote.js is untouched. This wraps the existing "email us" handoff: it
 * intercepts the mailto click, posts the lead to a real endpoint first, fires
 * the Google Ads conversion, then lets the mail client open as it does today.
 * If the post fails the mailto still works, so a visitor can never end up
 * worse off than before this file existed.
 */

var PSI = {
  // Live endpoint, deployed Sept 9 2026 and tested end to end. A Google Apps
  // Script inside the PSI Ads Data workbook: it writes each lead straight into
  // Lead_Log with the Google click ID attached, then emails info@.
  LEAD_ENDPOINT: 'https://script.google.com/macros/s/AKfycbzIKtNmKrVg-huG2U57I_xbHZSYk3L2E8BVfq06G6tWYrxCVOXQS23fgfrMVceK1jBy/exec',

  // Must match SHARED_TOKEN in the Apps Script. Visible in page source by
  // design — it deters drive-by bots, it is not a secret.
  LEAD_TOKEN: 'psi-2026-lead-9f3a71',

  // Google Ads conversion action "Raw Lead", account 434-715-7897.
  ADS_CONVERSION_ID:    'AW-17854404861',
  ADS_CONVERSION_LABEL: 'AW-17854404861/amrCCL2gn_IcEP2x0sFC',

  // GA4 property "psiconstructionpa.com", Eastern time.
  GA4_MEASUREMENT_ID: 'G-85V8X6P3CR'
};

(function () {
  'use strict';

  // ---------- Google click ID capture ----------
  // Google appends ?gclid=... to the landing page on every ad click. Stored for
  // 90 days, which matches Google's offline conversion import window. Without
  // this there is no way to connect an ad click to a signed contract.

  function getParam(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m.pop()) : '';
  }

  var incoming = getParam('gclid');
  if (incoming) setCookie('psi_gclid', incoming, 90);

  // Also remember where the visitor came from, for the daily brief.
  if (!getCookie('psi_source')) {
    var src = getParam('utm_source') ||
      (document.referrer ? (document.referrer.split('/')[2] || '') : 'direct');
    setCookie('psi_source', src || 'direct', 90);
    setCookie('psi_landing', window.location.pathname, 90);
    setCookie('psi_first_seen', new Date().toISOString(), 90);
  }

  // ---------- Google tags ----------

  // A value counts as "not filled in yet" only if it still contains a run of
  // five or more consecutive X's (the placeholder shape). Real IDs can contain
  // a stray X — G-85V8X6P3CR does — so a naive indexOf('X') check would
  // wrongly skip loading Analytics entirely.
  function isPlaceholder(v) {
    return !v || /X{5,}/.test(v) || v.indexOf('PASTE') === 0;
  }

  function loadTags() {
    var ids = [];
    if (!isPlaceholder(PSI.GA4_MEASUREMENT_ID)) ids.push(PSI.GA4_MEASUREMENT_ID);
    if (!isPlaceholder(PSI.ADS_CONVERSION_ID)) ids.push(PSI.ADS_CONVERSION_ID);
    if (!ids.length) return;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ids[0];
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    ids.forEach(function (id) { gtag('config', id); });
  }
  loadTags();

  // ---------- Lead submission ----------

  function submitLead(summaryText, subject) {
    if (isPlaceholder(PSI.LEAD_ENDPOINT)) return Promise.resolve(false);

    var payload = {
      token: PSI.LEAD_TOKEN,
      subject: subject || 'New quote request — psiconstructionpa.com',
      message: summaryText,
      // Pulled out of the summary so it lands in its own column. This is the
      // field that answers "what size work are we actually getting?"
      budget_range: (function () {
        var m = /(?:budget|range|planning for)[^\n]*[\n:]\s*([^\n]{2,60})/i.exec(summaryText || '');
        return m ? m[1].trim() : '';
      })(),
      // Attribution — what makes the lead traceable back to a click:
      gclid: getCookie('psi_gclid'),
      traffic_source: getCookie('psi_source') || 'unknown',
      landing_page: getCookie('psi_landing') || '',
      first_seen: getCookie('psi_first_seen') || '',
      submitted_at: new Date().toISOString(),
      page: window.location.href
    };

    // text/plain keeps this a "simple" cross-origin request, so the browser
    // never sends a CORS preflight — Apps Script web apps cannot answer one.
    // no-cors means we cannot read the reply, which is fine: the mailto below
    // still opens either way, so the visitor is never worse off than today.
    return fetch(PSI.LEAD_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function () { return true; }).catch(function () { return false; });
  }

  function fireConversion() {
    if (typeof window.gtag !== 'function') return;
    if (!isPlaceholder(PSI.ADS_CONVERSION_LABEL)) {
      gtag('event', 'conversion', { send_to: PSI.ADS_CONVERSION_LABEL });
    }
    gtag('event', 'generate_lead', {
      event_category: 'quote_form',
      event_label: getCookie('psi_source') || 'unknown'
    });
  }

  // ---------- Intercept the existing mailto handoff ----------
  // quote.js finishes by rendering a mailto link. We catch the click, send the
  // lead to a real endpoint, fire the conversion, then let the mail client open.

  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!link) return;

    if (link.getAttribute('data-psi-sent') === '1') return; // already handled

    var href = link.getAttribute('href') || '';
    var body = '';
    var subject = '';
    try {
      var qs = href.split('?')[1] || '';
      qs.split('&').forEach(function (pair) {
        var kv = pair.split('=');
        var k = (kv[0] || '').toLowerCase();
        var v = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
        if (k === 'body') body = v;
        if (k === 'subject') subject = v;
      });
    } catch (err) { /* fall through — mailto still works */ }

    if (!body) return; // nothing useful to capture; let it through untouched

    e.preventDefault();
    link.setAttribute('data-psi-sent', '1');

    var done = false;
    function proceed() {
      if (done) return;
      done = true;
      window.location.href = href; // open mail client as a backup copy
    }

    fireConversion();
    submitLead(body, subject).then(proceed);
    setTimeout(proceed, 1200); // never leave the visitor waiting
  }, true);

  // ---------- Track calls ----------

  document.addEventListener('click', function (e) {
    var tel = e.target && e.target.closest && e.target.closest('a[href^="tel:"]');
    if (!tel || typeof window.gtag !== 'function') return;
    gtag('event', 'phone_call_click', {
      event_category: 'contact',
      event_label: getCookie('psi_source') || 'unknown'
    });
  }, true);

  window.PSI_submitLead = submitLead; // in case the form is wired up directly later
})();
