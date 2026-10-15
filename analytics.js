/*
  ANALYTICS.JS: consent-gated Google Analytics 4.

  Nothing happens until GA_MEASUREMENT_ID below is filled in (looks like "G-XXXXXXXXXX").
  Once it is set:
    - A small cookie notice appears on first visit with Accept / Decline.
    - Google Analytics loads ONLY after the visitor clicks Accept.
    - The choice is remembered in the visitor's browser (localStorage).
    - A "Cookie settings" link in the footer lets them change their mind.
  While the ID is empty, no banner is shown and no analytics code loads.
*/
(function () {
  var GA_MEASUREMENT_ID = ''; // <-- paste the GA4 Measurement ID here when ready
  if (!GA_MEASUREMENT_ID) return;

  var KEY = 'di-analytics-consent'; // "granted" | "denied"
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadGA() {
    if (window.__diGaLoaded) return;
    window.__diGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
  }

  function clearGaCookies() {
    // Remove first-party GA cookies if a visitor changes from Accept to Decline.
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid') {
        ['', '.' + location.hostname, '.' + location.hostname.replace(/^www\./, '')].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  var css = '' +
    '#di-consent{position:fixed;left:0;right:0;bottom:0;z-index:1000;background:#fff;border-top:1px solid rgba(46,42,63,.14);box-shadow:0 -10px 30px rgba(46,42,63,.12);padding:16px 20px;font-family:Atkinson Hyperlegible Next,sans-serif;color:#2E2A3F}' +
    '#di-consent .in{max-width:1000px;margin:0 auto;display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap}' +
    '#di-consent p{margin:0;font-size:14.5px;line-height:1.5;flex:1 1 420px;color:#2E2A3F}' +
    '#di-consent a{text-decoration:underline;font-weight:600}' +
    '#di-consent .btns{display:flex;gap:10px;flex:none}' +
    '#di-consent button{font-family:Atkinson Hyperlegible Next,sans-serif;font-weight:600;font-size:15px;padding:11px 22px;border-radius:40px;cursor:pointer;border:1.5px solid #2E2A3F;background:#fff;color:#2E2A3F}' +
    '#di-consent button.yes{background:#2E2A3F;color:#fff}' +
    '#di-consent button:focus-visible{outline:3px solid #3BAFA3;outline-offset:2px}' +
    '@media(max-width:560px){#di-consent{padding:14px 16px}#di-consent .btns{width:100%}#di-consent button{flex:1}}' +
    'body.di-consent-open #a11y-toggle{bottom:calc(var(--di-consent-h,90px) + 12px) !important}' +
    'body.di-consent-open #a11y-panel{bottom:calc(var(--di-consent-h,90px) + 64px) !important}';

  function injectCss() {
    if (document.getElementById('di-consent-css')) return;
    var st = document.createElement('style'); st.id = 'di-consent-css'; st.textContent = css;
    document.head.appendChild(st);
  }

  function hideBanner() {
    var b = document.getElementById('di-consent');
    if (b) b.parentNode.removeChild(b);
    document.body.classList.remove('di-consent-open');
  }

  function showBanner() {
    injectCss();
    hideBanner();
    var b = document.createElement('div');
    b.id = 'di-consent';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Cookie notice');
    b.innerHTML = '<div class="in"><p>We\'d like to use analytics cookies to understand how people use this site and make it better. They\'re optional. See our <a href="/privacy">Privacy Policy</a>.</p>' +
      '<div class="btns"><button type="button" class="no">Decline</button><button type="button" class="yes">Accept</button></div></div>';
    document.body.appendChild(b);
    document.body.classList.add('di-consent-open');
    document.documentElement.style.setProperty('--di-consent-h', b.offsetHeight + 'px');
    b.querySelector('.yes').addEventListener('click', function () { set('granted'); hideBanner(); loadGA(); });
    b.querySelector('.no').addEventListener('click', function () { set('denied'); hideBanner(); clearGaCookies(); });
  }

  function addFooterLink() {
    var host = document.querySelector('.foot-bottom span:last-child') || document.querySelector('footer');
    if (!host || document.getElementById('di-cookie-settings')) return;
    var a = document.createElement('a');
    a.id = 'di-cookie-settings'; a.href = '#'; a.textContent = 'Cookie settings';
    a.style.marginLeft = '6px';
    a.addEventListener('click', function (e) { e.preventDefault(); showBanner(); });
    host.appendChild(document.createTextNode(' · '));
    host.appendChild(a);
  }

  function init() {
    addFooterLink();
    var c = get();
    if (c === 'granted') loadGA();
    else if (c !== 'denied') showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
