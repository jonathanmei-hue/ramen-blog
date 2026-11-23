// ============================================================================
// CM360 / Floodlight Configuration
// Replace these placeholders with your real CM360 Floodlight IDs before launch.
// Format for send_to: 'DC-<floodlight_config_id>/<group_tag_string>/<activity_tag_string>+<counting_method>'
// ============================================================================
const CM360_CONFIG = {
  floodlightConfigId: 'DC-XXXXXXXX',
  // Counter activity (e.g., landing page / article view)
  pageViewSendTo: 'DC-XXXXXXXX/blog/pageview+standard',
  // Counter activity (e.g., newsletter signup)
  newsletterSendTo: 'DC-XXXXXXXX/leads/signup+unique',
  // Sales activity (e.g., demo ramen kit order)
  purchaseSendTo: 'DC-XXXXXXXX/sales/ramenkit+transactions',
};

const POSTS = [
  {
    id: 'hakata-tonkotsu',
    category: 'tonkotsu',
    tag: 'Tonkotsu',
    title: '18-Hour Hakata Tonkotsu Without a Cloud of Guesswork',
    meta: '12 min read · Broth Lab',
    excerpt:
      'Blanching, rolling boil physics, and why a 2:1 femur-to-trotter ratio gives you that creamy, lip-sticking emulsion.',
    body: [
      'Great tonkotsu is an emulsion of rendered pork fat, dissolved collagen, and water. Keep the boil vigorous—never a gentle simmer—so the fat shears into microscopic droplets that stay suspended.',
      'Start with a 30-minute blanch of split pork femurs and trotters, scrub every bone clean under cold water, then boil uncovered for 12–18 hours, topping up with boiling water to keep bones submerged.',
      'Season each bowl with 30 ml of shio-shoyu tare, 15 ml of aromatic lard, ultra-thin straight Hakata noodles cooked for 45 seconds, and a soft-yolk ajitama marinated in 1:1:4 soy, mirin, and water.'
    ]
  },
  {
    id: 'tokyo-shoyu',
    category: 'shoyu',
    tag: 'Shoyu',
    title: 'Clear Tokyo Shoyu: Balancing Chicken Chintan & Aged Soy',
    meta: '8 min read · Weeknight Classic',
    excerpt:
      'A crystal-clear golden chicken-dashi broth paired with a double-fermented shoyu tare and scallion-infused chicken oil.',
    body: [
      'Unlike tonkotsu, a Tokyo shoyu chintan demands restraint: keep the pot just below a simmer (85–90°C) for 5 hours so the broth stays jewel-clear.',
      'Steep kombu and niboshi in the last 45 minutes after cutting the heat. Pair with a tare built from usukuchi and kioke-aged dark soy sauce, mirin, and a pinch of sake.',
      'Finish with warm schmaltz (rendered chicken fat) infused with charred negi whites—the aroma hits before the spoon even touches the broth.'
    ]
  },
  {
    id: 'sapporo-miso',
    category: 'miso',
    tag: 'Miso',
    title: 'Wok-Seared Sapporo Red Miso with Sweet Corn & Butter',
    meta: '9 min read · Winter Bowls',
    excerpt:
      'Caramelizing miso paste in sizzling lard with minced ginger, garlic, and ground pork before deglazing with hot stock.',
    body: [
      'Never just whisk miso into boiling broth—flash-frying it in a smoking-hot wok with lard, garlic, ginger, and white onion unlocks nutty Maillard depth you cannot get any other way.',
      'Use a 70/30 blend of red aka-miso and sweet white shiro-miso, deglaze with rich pork-chicken stock, and pour over high-hydration curled yellow noodles.',
      'Top with wok-charred bean sprouts, sweet corn, and a pat of cultured butter that melts into the chili-flecked surface.'
    ]
  },
  {
    id: 'spicy-tantanmen',
    category: 'spicy',
    tag: 'Spicy',
    title: 'Sesame-Rich Tantanmen with Homemade Sichuan Chili Oil',
    meta: '10 min read · Spice Rack',
    excerpt:
      'Toasted white sesame paste (nerigoma), black vinegar brightness, and numbing erjingtiao chili oil over silky dashi.',
    body: [
      'Tantanmen lives on the tension between rich toasted sesame paste, tangy Chinkiang black vinegar, and fragrant chili oil.',
      'Whisk 2 tablespoons of nerigoma, 1 tablespoon of shoyu tare, 1 teaspoon of black vinegar, and 2 tablespoons of chili oil directly in the serving bowl, then temper slowly with hot chicken broth.',
      'Crown with crispy stir-fried pork soboro seasoned with doubanjiang and blanched baby bok choy.'
    ]
  }
];

// ============================================================================
// Attribution Parameter Capture (dclid / gclid / utm_*)
// ============================================================================
const TRACKED_PARAMS = [
  'dclid',
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term'
];

function captureAttributionParams() {
  const stored = JSON.parse(sessionStorage.getItem('cm360_attribution') || '{}');
  const urlParams = new URLSearchParams(window.location.search);
  let updated = false;

  for (const key of TRACKED_PARAMS) {
    const val = urlParams.get(key);
    if (val) {
      stored[key] = val;
      updated = true;
    }
  }

  if (updated) {
    stored._captured_at = new Date().toISOString();
    sessionStorage.setItem('cm360_attribution', JSON.stringify(stored));
  }
  return stored;
}

const eventLog = [];

function fireFloodlightEvent(label, sendTo, extraParams = {}) {
  const payload = {
    send_to: sendTo,
    ...extraParams
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', payload);
  }

  eventLog.unshift({
    time: new Date().toLocaleTimeString(),
    label,
    payload
  });
  renderDebugDrawer();
}

// ============================================================================
// UI Rendering & Interactions
// ============================================================================
const postsGrid = document.getElementById('posts-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('article-modal');
const modalTag = document.getElementById('modal-tag');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalBody = document.getElementById('modal-body');

function renderPosts(filter = 'all') {
  const filtered = filter === 'all' ? POSTS : POSTS.filter((p) => p.category === filter);
  postsGrid.innerHTML = filtered
    .map(
      (post) => `
      <article class="post-card">
        <div>
          <p class="post-tag">${post.tag}</p>
          <h3>${post.title}</h3>
          <p class="post-excerpt">${post.excerpt}</p>
        </div>
        <div class="post-footer">
          <span>${post.meta}</span>
          <button class="read-btn" type="button" data-post-id="${post.id}">Read recipe →</button>
        </div>
      </article>
    `
    )
    .join('');
}

function openPost(postId) {
  const post = POSTS.find((p) => p.id === postId);
  if (!post) return;

  modalTag.textContent = post.tag;
  modalTitle.textContent = post.title;
  modalMeta.textContent = post.meta;
  modalBody.innerHTML = post.body.map((p) => `<p>${p}</p>`).join('');
  modal.hidden = false;

  // Fire a Floodlight counter event with custom variable u1 = article slug
  fireFloodlightEvent(`Article View (${post.id})`, CM360_CONFIG.pageViewSendTo, {
    u1: post.id,
    u2: post.category
  });
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    renderPosts(btn.dataset.filter);
  });
});

postsGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-post-id]');
  if (btn) openPost(btn.dataset.postId);
});

modal.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-close-modal')) {
    modal.hidden = true;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
});

// Demo Order (Sales Floodlight Conversion)
document.getElementById('buy-kit-btn').addEventListener('click', () => {
  const style = document.getElementById('kit-style').value;
  const qty = Math.max(1, parseInt(document.getElementById('kit-qty').value, 10) || 1);
  const value = +(qty * 38.0).toFixed(2);
  const transactionId = `RAMEN-${Date.now()}`;

  fireFloodlightEvent('Demo Kit Purchase (Sales)', CM360_CONFIG.purchaseSendTo, {
    value,
    currency: 'USD',
    transaction_id: transactionId,
    u1: style,
    u2: String(qty)
  });

  document.getElementById('order-status').textContent =
    `Demo order ${transactionId} recorded ($${value.toFixed(2)} · ${qty}x ${style}). Floodlight sales event fired.`;
});

// Newsletter Signup (Counter Floodlight Conversion)
document.getElementById('newsletter-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  const email = emailInput.value.trim();
  if (!email) return;

  fireFloodlightEvent('Newsletter Signup (Counter)', CM360_CONFIG.newsletterSendTo, {
    u1: 'newsletter_footer'
  });

  document.getElementById('newsletter-status').textContent =
    `Subscribed ${email}! Floodlight counter event fired.`;
  emailInput.value = '';
});

// ============================================================================
// CM360 Debug Inspector Drawer
// ============================================================================
const debugDrawer = document.getElementById('debug-drawer');
const debugParamsEl = document.getElementById('debug-params');
const debugEventsEl = document.getElementById('debug-events');

function renderDebugDrawer() {
  const params = JSON.parse(sessionStorage.getItem('cm360_attribution') || '{}');
  debugParamsEl.textContent =
    Object.keys(params).length > 0
      ? JSON.stringify(params, null, 2)
      : 'None yet. Try appending ?dclid=test123&utm_source=cm360';

  debugEventsEl.innerHTML =
    eventLog.length === 0
      ? '<li>No Floodlight events fired yet.</li>'
      : eventLog
          .map(
            (ev) =>
              `<li><strong>${ev.time} — ${ev.label}</strong><br/><code>${JSON.stringify(ev.payload)}</code></li>`
          )
          .join('');
}

document.getElementById('debug-toggle').addEventListener('click', () => {
  debugDrawer.hidden = !debugDrawer.hidden;
  renderDebugDrawer();
});

document.getElementById('debug-close').addEventListener('click', () => {
  debugDrawer.hidden = true;
});

// Init
document.getElementById('year').textContent = new Date().getFullYear();
const captured = captureAttributionParams();
renderPosts('all');

// Fire initial landing page Floodlight counter event
fireFloodlightEvent('Landing Page View', CM360_CONFIG.pageViewSendTo, {
  u1: 'home',
  u2: captured.utm_campaign || 'direct'
});

if (new URLSearchParams(window.location.search).get('debug') === '1') {
  debugDrawer.hidden = false;
  renderDebugDrawer();
}
