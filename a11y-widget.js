/*
  A11Y-WIDGET.JS — a small, transparent accessibility toolbar.

  This is NOT a substitute for building the site to be accessible by
  default (semantic HTML, real color contrast, alt text, keyboard nav,
  proper headings). It's a convenience layer on top of that, giving
  visitors direct control over text size, contrast, brightness, dark
  mode, link underlining, and motion — nothing more is claimed.

  Include on every page with a single line, right before </head>:
    <script src="a11y-widget.js" defer></script>
  (from inside /blog, use src="../a11y-widget.js")

  Preferences are saved in localStorage and apply across every page on
  the same domain. Note: when testing locally via file://, some browsers
  isolate localStorage per file rather than per folder, so preferences
  may not carry between pages until this is served from a real domain.

  Text size uses the CSS `zoom` property rather than a root font-size
  trick, because this site's type scale is authored in fixed px values
  throughout (not rem/em), so a root font-size change wouldn't cascade.
  `zoom` is well supported in Chromium and Safari, and in Firefox 126+
  (2024). Visitors on older Firefox can still use their browser's own
  Ctrl/Cmd + "+" zoom, which always works regardless of this widget.
*/
(function () {
  var STORAGE_KEY = 'a11y-prefs';
  var TEXT_STEPS = [1, 1.15, 1.3];
  var BRIGHTNESS_MIN = 0.85, BRIGHTNESS_MAX = 1.3, BRIGHTNESS_STEP = 0.05;

  var defaults = { textStep: 0, contrast: false, brightness: 1, dark: false, underline: false, reduceMotion: false };
  var state = loadState();

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Object.assign({}, defaults, saved || {});
    } catch (e) {
      return Object.assign({}, defaults);
    }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---- Apply current state to the page (safe to call before body exists) ----
  function applyState() {
    var html = document.documentElement;
    html.style.zoom = TEXT_STEPS[state.textStep];
    html.classList.toggle('a11y-contrast', state.contrast);
    html.classList.toggle('a11y-underline', state.underline);
    html.classList.toggle('a11y-reduce-motion', state.reduceMotion);
    html.classList.toggle('a11y-dark', state.dark);

    var filters = [];
    if (state.dark) filters.push('invert(1) hue-rotate(180deg)');
    if (state.brightness !== 1) filters.push('brightness(' + state.brightness + ')');
    html.style.filter = filters.join(' ');
  }

  // ---- Base styles for the effects themselves (injected once) ----
  var style = document.createElement('style');
  style.textContent = [
    'html.a11y-contrast{--ink:#000;--muted:#111;--line:rgba(0,0,0,.4);--paper:#fff;--sand:#fff}',
    'html.a11y-underline a[href]{text-decoration:underline !important}',
    'html.a11y-reduce-motion *{animation:none !important;transition:none !important}',
    'html.a11y-reduce-motion .reveal{opacity:1 !important;transform:none !important}',
    /* compensate so real photos/placeholders don't render inverted under dark mode */
    'html.a11y-dark img,html.a11y-dark video,html.a11y-dark .fi-ph,html.a11y-dark .hero-media img,html.a11y-dark .cal-host .av,html.a11y-dark .photo img,html.a11y-dark .blob img,html.a11y-dark .author-card .av{filter:invert(1) hue-rotate(180deg)}',
    /* widget UI itself, kept out of the way and legible in every mode */
    '#a11y-toggle{position:fixed;bottom:22px;left:22px;z-index:999;width:52px;height:52px;border-radius:50%;background:#2E2A3F;color:#fff;border:none;cursor:pointer;font-family:Fredoka,sans-serif;font-weight:700;font-size:15px;box-shadow:0 10px 26px rgba(0,0,0,.24);filter:none !important}',
    '#a11y-toggle:hover{transform:translateY(-2px)}',
    '#a11y-panel{position:fixed;bottom:84px;left:22px;z-index:999;width:296px;max-width:calc(100vw - 44px);background:#fff;border:1px solid rgba(0,0,0,.14);border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,.2);padding:18px;display:none;font-family:Inter,sans-serif;color:#2E2A3F;filter:none !important}',
    '#a11y-panel.open{display:block}',
    '#a11y-panel h4{font-family:Fredoka,sans-serif;font-size:15px;font-weight:600;margin:0 0 14px}',
    '.a11y-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;font-size:13.5px;font-weight:600;gap:10px}',
    '.a11y-row .a11y-btns{display:flex;gap:6px;align-items:center}',
    '.a11y-row button.a11y-step{width:28px;height:28px;border-radius:8px;border:1px solid rgba(0,0,0,.18);background:#fff;cursor:pointer;font-weight:700;font-size:13px;line-height:1;color:#2E2A3F}',
    '.a11y-row button.a11y-step:hover{border-color:#3BAFA3}',
    '.a11y-switch{width:40px;height:22px;border-radius:20px;background:rgba(0,0,0,.16);position:relative;cursor:pointer;border:none;flex:none;padding:0}',
    '.a11y-switch.on{background:#3BAFA3}',
    '.a11y-switch .knob{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .15s}',
    '.a11y-switch.on .knob{left:20px}',
    '#a11y-reset{width:100%;text-align:center;margin-top:4px;padding:9px;border-radius:10px;border:1px solid rgba(0,0,0,.18);background:#F7F5F0;font-weight:700;font-size:12.5px;cursor:pointer;color:#2E2A3F;font-family:Inter,sans-serif}',
    '#a11y-reset:hover{border-color:#F2785C;color:#F2785C}',
    '@media(max-width:480px){#a11y-toggle,#a11y-panel{left:14px}#a11y-panel{bottom:78px}}'
  ].join('\n');
  document.head.appendChild(style);

  // Apply saved preferences immediately so there's no flash of un-adjusted content.
  applyState();

  // ---- Build the toggle button + panel once the DOM is ready ----
  function buildUI() {
    var toggle = document.createElement('button');
    toggle.id = 'a11y-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Accessibility settings');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Aa';

    var panel = document.createElement('div');
    panel.id = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Accessibility settings');
    panel.innerHTML =
      '<h4>Accessibility settings</h4>' +
      '<div class="a11y-row"><span>Text size</span><div class="a11y-btns">' +
        '<button type="button" class="a11y-step" data-act="text-down" aria-label="Decrease text size">A−</button>' +
        '<button type="button" class="a11y-step" data-act="text-up" aria-label="Increase text size">A+</button>' +
      '</div></div>' +
      '<div class="a11y-row"><span>High contrast</span><button type="button" class="a11y-switch" data-toggle="contrast" aria-pressed="false"><span class="knob"></span></button></div>' +
      '<div class="a11y-row"><span>Brightness</span><div class="a11y-btns">' +
        '<button type="button" class="a11y-step" data-act="bright-down" aria-label="Decrease brightness">−</button>' +
        '<button type="button" class="a11y-step" data-act="bright-up" aria-label="Increase brightness">+</button>' +
      '</div></div>' +
      '<div class="a11y-row"><span>Dark mode</span><button type="button" class="a11y-switch" data-toggle="dark" aria-pressed="false"><span class="knob"></span></button></div>' +
      '<div class="a11y-row"><span>Underline links</span><button type="button" class="a11y-switch" data-toggle="underline" aria-pressed="false"><span class="knob"></span></button></div>' +
      '<div class="a11y-row"><span>Reduce motion</span><button type="button" class="a11y-switch" data-toggle="reduceMotion" aria-pressed="false"><span class="knob"></span></button></div>' +
      '<button type="button" id="a11y-reset">Reset to default</button>';

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    function syncUI() {
      panel.querySelectorAll('.a11y-switch').forEach(function (btn) {
        var key = btn.dataset.toggle;
        var on = !!state[key];
        btn.classList.toggle('on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    syncUI();

    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    panel.addEventListener('click', function (e) {
      var stepBtn = e.target.closest('.a11y-step');
      var switchBtn = e.target.closest('.a11y-switch');
      var resetBtn = e.target.closest('#a11y-reset');

      if (stepBtn) {
        var act = stepBtn.dataset.act;
        if (act === 'text-up') state.textStep = Math.min(TEXT_STEPS.length - 1, state.textStep + 1);
        if (act === 'text-down') state.textStep = Math.max(0, state.textStep - 1);
        if (act === 'bright-up') state.brightness = Math.min(BRIGHTNESS_MAX, +(state.brightness + BRIGHTNESS_STEP).toFixed(2));
        if (act === 'bright-down') state.brightness = Math.max(BRIGHTNESS_MIN, +(state.brightness - BRIGHTNESS_STEP).toFixed(2));
      } else if (switchBtn) {
        var key = switchBtn.dataset.toggle;
        state[key] = !state[key];
      } else if (resetBtn) {
        state = Object.assign({}, defaults);
      } else {
        return;
      }
      applyState();
      syncUI();
      saveState();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }
})();
