/**
 * Główna aplikacja — renderowanie, nawigacja SPA, i18n.
 */

import {
  getStoredLocale,
  setStoredLocale,
  getLocaleBundle,
  format,
} from './i18n.js';

const CHECKLIST_STORAGE_KEY = 'tpm-checklist-v1';

/** @type {'pl' | 'en'} */
let currentLocale = getStoredLocale();
/** @type {ReturnType<typeof getLocaleBundle>} */
let bundle = getLocaleBundle(currentLocale);
let activePhase = 1;

function t() {
  return bundle.ui;
}

function data() {
  return bundle;
}

/** @param {string} level */
function levelBadge(level) {
  if (!level || level === '—') {
    return '<span class="level-badge na">—</span>';
  }
  const cls = level.toLowerCase();
  return `<span class="level-badge ${cls}">${level}</span>`;
}

function renderList(id, items) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = items.map((i) => `<li>${i}</li>`).join('');
}

function applyUiStatic() {
  const ui = t();
  document.documentElement.lang = currentLocale;
  document.title = ui.pageTitle;

  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = ui.metaDescription;

  const skip = document.querySelector('.skip-link');
  if (skip) skip.textContent = ui.skipLink;

  const logoSub = document.querySelector('.logo-text small');
  if (logoSub) logoSub.textContent = ui.logoSubtitle;

  const nav = document.getElementById('site-nav');
  if (nav) nav.setAttribute('aria-label', ui.navLabel);

  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) navToggle.setAttribute('aria-label', ui.menuLabel);

  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.textContent = ui.langSwitch;
    langBtn.setAttribute('aria-label', ui.langSwitchAria);
  }

  const navMap = [
    ['home', ui.nav.home],
    ['roles', ui.nav.roles],
    ['competencies', ui.nav.competencies],
    ['plan', ui.nav.plan],
    ['kpi', ui.nav.kpi],
    ['checklist', ui.nav.checklist],
  ];
  navMap.forEach(([key, label]) => {
    const link = document.querySelector(`.nav-link[data-nav="${key}"]`);
    if (link) link.textContent = label;
  });

  const h = ui.home;
  setText('#home-eyebrow', h.eyebrow);
  setText('#home-title', h.title);
  setText('#home-lead', h.lead);
  setText('#home-cta-plan', h.ctaPlan);
  setText('#home-cta-competencies', h.ctaCompetencies);
  setText('#t-shape-title', h.tShapeTitle);
  setText('#t-shape-wide-title', h.tShapeWideTitle);
  setText('#t-shape-deep-title', h.tShapeDeepTitle);
  renderList('t-shape-wide-list', h.tShapeWideItems);
  renderList('t-shape-deep-list', h.tShapeDeepItems);
  setText('#assumptions-title', h.assumptionsTitle);

  const r = ui.roles;
  setText('#roles-title', r.title);
  setText('#roles-subtitle', r.subtitle);
  setText('#roles-th-role', r.colRole);
  setText('#roles-th-code', r.colCode);
  setText('#roles-th-count', r.colCount);
  setText('#roles-th-resp', r.colResponsibility);
  setText('#training-title', r.trainingTitle);
  setText('#training-th-area', r.colArea);
  setText('#training-th-trainer', r.colTrainer);
  setText('#training-th-backup', r.colBackup);
  setText('#training-th-recipients', r.colRecipients);
  setText('#hours-title', r.hoursTitle);
  setText('#hours-th-role', r.colRole);
  setText('#hours-th-p1', r.colPhase1);
  setText('#hours-th-p2', r.colPhase2);
  setText('#hours-th-p3', r.colPhase3);
  setText('#hours-th-total', r.colTotal);

  const c = ui.competencies;
  setText('#competencies-title', c.title);
  const sub = document.getElementById('competencies-subtitle');
  if (sub) {
    sub.innerHTML = `${c.subtitleBefore}
      <span class="level-badge l1">L1</span> ${c.levelL1} ·
      <span class="level-badge l2">L2</span> ${c.levelL2} ·
      <span class="level-badge l3">L3</span> ${c.levelL3}`;
  }
  setText('#filter-domain-label', c.filterDomain);
  setText('#filter-role-label', c.filterRole);
  setText('#legend-title', c.legendTitle);
  setText('#legend-l1', c.legendL1);
  setText('#legend-l2', c.legendL2);
  setText('#legend-l3', c.legendL3);
  setText('#legend-na', c.legendNa);

  const p = ui.plan;
  setText('#plan-title', p.title);
  setText('#plan-subtitle', p.subtitle);
  document.querySelector('.phase-tabs')?.setAttribute('aria-label', p.phasesLabel);
  setText('#phase-tab-1', p.phaseTab1);
  setText('#phase-tab-2', p.phaseTab2);
  setText('#phase-tab-3', p.phaseTab3);
  setText('#artifacts-title', p.artifactsTitle);
  setText('#artifacts-th-name', p.colArtifact);
  setText('#artifacts-th-deadline', p.colDeadline);
  setText('#artifacts-th-owner', p.colOwner);

  const k = ui.kpi;
  setText('#kpi-title', k.title);
  setText('#kpi-subtitle', k.subtitle);
  setText('#roadmap-title', k.roadmapTitle);
  document.getElementById('roadmap-list').innerHTML = k.roadmap
    .map((item) => `<li><span class="tag tag-future">${item.tag}</span> ${item.text}</li>`)
    .join('');

  const cl = ui.checklist;
  setText('#checklist-title', cl.title);
  setText('#checklist-subtitle', cl.subtitle);
  setText('#reset-checklist', cl.reset);

  setText('#footer-line1-prefix', ui.footer.line1);
  setText('#footer-line2-prefix', ui.footer.line2);
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function renderOverview() {
  document.getElementById('app-version').textContent = data().config.version;

  document.getElementById('overview-cards').innerHTML = data()
    .overviewCards.map(
      (c) => `
    <article class="card">
      <div class="card-icon" aria-hidden="true">${c.icon}</div>
      <h3>${c.title}</h3>
      <p>${c.description}</p>
    </article>`
    )
    .join('');

  const labels = t().home.pilotLabels;
  document.getElementById('assumptions-list').innerHTML = Object.entries(data().config.pilot)
    .map(([key, val]) => `<div><dt>${labels[key] || key}</dt><dd>${val}</dd></div>`)
    .join('');
}

function renderRoles() {
  document.querySelector('#roles-table tbody').innerHTML = data()
    .roles.map(
      (r) => `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td><code>${r.id}</code></td>
      <td>${r.count}</td>
      <td>${r.responsibility}</td>
    </tr>`
    )
    .join('');

  document.querySelector('#training-matrix tbody').innerHTML = data()
    .trainingMatrix.map(
      (row) => `
    <tr>
      <td>${row.area}</td>
      <td>${row.trainer}</td>
      <td>${row.backup}</td>
      <td>${row.recipients}</td>
    </tr>`
    )
    .join('');

  document.querySelector('#training-hours tbody').innerHTML = data()
    .trainingHours.map(
      (row) => `
    <tr>
      <td>${row.role}</td>
      <td>${row.phase1}</td>
      <td>${row.phase2}</td>
      <td>${row.phase3}</td>
      <td><strong>${row.total}</strong></td>
    </tr>`
    )
    .join('');
}

function renderCompetencies(filterDomain = 'all', filterRole = 'all') {
  const ui = t().competencies;
  const domainSelect = document.getElementById('domain-filter');
  const roleSelect = document.getElementById('role-filter');
  const roleLabels = data().roleLabels;

  const prevDomain = domainSelect.value || 'all';
  const prevRole = roleSelect.value || 'all';
  if (filterDomain === 'all' && prevDomain !== 'all') filterDomain = prevDomain;
  if (filterRole === 'all' && prevRole !== 'all') filterRole = prevRole;

  domainSelect.innerHTML = `<option value="all">${ui.filterAll}</option>`;
  data().competencyDomains.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.name.replace(/^\d+\.\s*/, '');
    domainSelect.appendChild(opt);
  });

  roleSelect.innerHTML = `<option value="all">${ui.filterAll}</option>`;
  Object.entries(roleLabels).forEach(([id, label]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = label;
    roleSelect.appendChild(opt);
  });

  domainSelect.value = filterDomain;
  roleSelect.value = filterRole;

  const roleIds = Object.keys(roleLabels);
  const filtered = data().competencyDomains.filter(
    (d) => filterDomain === 'all' || d.id === filterDomain
  );

  document.getElementById('competency-domains').innerHTML = filtered
    .map((domain) => {
      const skills = domain.skills.filter((skill) => {
        if (filterRole === 'all') return true;
        const lvl = skill.levels[filterRole];
        return lvl && lvl !== '—';
      });
      if (skills.length === 0) return '';

      const headerCells = roleIds.map((id) => `<th>${roleLabels[id]}</th>`).join('');
      const rows = skills
        .map((skill) => {
          const cells = roleIds.map((id) => `<td>${levelBadge(skill.levels[id])}</td>`).join('');
          return `<tr><td>${skill.name}</td>${cells}</tr>`;
        })
        .join('');

      return `
      <div class="domain-block" data-domain="${domain.id}">
        <div class="domain-header">${domain.name}</div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>${ui.colSkill}</th>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
    })
    .join('');
}

function renderPhase(phaseId) {
  activePhase = phaseId;
  const phase = data().phases.find((p) => p.id === phaseId);
  if (!phase) return;

  const p = t().plan;
  document.getElementById('phase-summary').innerHTML = `
    <h3>${phase.title} · ${phase.days}</h3>
    <p><strong>${p.goalLabel}</strong> ${phase.goal}</p>
  `;

  document.getElementById('timeline').innerHTML = phase.weeks
    .map(
      (w) => `
    <details class="week-card">
      <summary>
        <span class="week-num">T${w.week}</span>
        ${p.weekLabel} ${w.week}
      </summary>
      <div class="week-body">
        <div class="week-grid">
          <div>
            <h4>${p.actions}</h4>
            <ul>${w.actions.map((a) => `<li>${a}</li>`).join('')}</ul>
          </div>
          <div>
            <h4>${p.competencies}</h4>
            <ul>${w.competencies.map((c) => `<li>${c}</li>`).join('')}</ul>
          </div>
          <div>
            <h4>${p.deliverable}</h4>
            <p class="deliverable">${w.deliverable}</p>
          </div>
        </div>
      </div>
    </details>`
    )
    .join('');

  document.querySelectorAll('.phase-tab').forEach((tab) => {
    const active = Number(tab.dataset.phase) === phaseId;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}

function renderPlan() {
  document.querySelector('#artifacts-table tbody').innerHTML = data()
    .artifacts.map(
      (a) => `
    <tr>
      <td>${a.name}</td>
      <td>${a.deadline}</td>
      <td>${a.owner}</td>
    </tr>`
    )
    .join('');
  renderPhase(activePhase);
}

function renderKpi() {
  document.getElementById('kpi-phases').innerHTML = data()
    .phases.map(
      (p) => `
    <article class="kpi-phase">
      <h3>${p.title} (${p.days})</h3>
      <ul class="kpi-list">
        ${p.kpis.map((k) => `<li>${k}</li>`).join('')}
      </ul>
    </article>`
    )
    .join('');
}

function loadChecklistState() {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecklistState(state) {
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state));
}

function updateChecklistProgress() {
  const boxes = document.querySelectorAll('#readiness-checklist input[type="checkbox"]');
  const checked = [...boxes].filter((b) => b.checked).length;
  const total = boxes.length;
  const pct = total ? Math.round((checked / total) * 100) : 0;
  const cl = t().checklist;

  document.getElementById('checklist-progress-fill').style.width = `${pct}%`;
  document.getElementById('checklist-progress-text').textContent = format(cl.progress, {
    checked,
    total,
  });

  document.querySelector('.progress-bar')?.setAttribute('aria-valuenow', String(pct));

  const resultEl = document.getElementById('checklist-result');
  if (checked === 0) {
    resultEl.hidden = true;
    return;
  }

  resultEl.hidden = false;
  if (checked >= 4) {
    resultEl.className = 'checklist-result success';
    resultEl.textContent = format(cl.success, { count: checked });
  } else {
    resultEl.className = 'checklist-result warning';
    resultEl.textContent = format(cl.warning, { count: checked });
  }
}

function renderChecklist() {
  const state = loadChecklistState();
  const list = document.getElementById('readiness-checklist');

  list.innerHTML = data()
    .readinessChecklist.map((item, i) => {
      const id = `check-${i}`;
      const checked = state[id] ? 'checked' : '';
      return `
      <li>
        <label for="${id}">
          <input type="checkbox" id="${id}" data-id="${id}" ${checked}>
          <span>${item}</span>
        </label>
      </li>`;
    })
    .join('');

  if (!list.dataset.bound) {
    list.dataset.bound = 'true';
    list.addEventListener('change', (e) => {
      if (e.target.matches('input[type="checkbox"]')) {
        const s = loadChecklistState();
        s[e.target.dataset.id] = e.target.checked;
        saveChecklistState(s);
        updateChecklistProgress();
      }
    });
  }

  const resetBtn = document.getElementById('reset-checklist');
  if (!resetBtn.dataset.bound) {
    resetBtn.dataset.bound = 'true';
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(CHECKLIST_STORAGE_KEY);
      renderChecklist();
    });
  }

  updateChecklistProgress();
}

function renderAll() {
  applyUiStatic();
  renderOverview();
  renderRoles();
  renderCompetencies();
  renderPlan();
  renderKpi();
  renderChecklist();
}

function switchLocale() {
  currentLocale = currentLocale === 'pl' ? 'en' : 'pl';
  setStoredLocale(currentLocale);
  bundle = getLocaleBundle(currentLocale);
  renderAll();
}

function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach((p) => {
    const isActive = p.id === pageId;
    p.classList.toggle('active', isActive);
    p.hidden = !isActive;
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === pageId);
  });

  history.replaceState({ page: pageId }, '', `#${pageId}`);

  document.getElementById('site-nav')?.classList.remove('open');
  document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
}

const PAGE_IDS = ['home', 'roles', 'competencies', 'plan', 'kpi', 'checklist'];

function resolvePageId(hash) {
  const page = hash.replace(/^#/, '') || 'home';
  return PAGE_IDS.includes(page) ? page : 'home';
}

function initNavigation() {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });

  window.addEventListener('popstate', (e) => {
    navigateTo(resolvePageId(e.state?.page ? `#${e.state.page}` : location.hash));
  });

  window.addEventListener('hashchange', () => {
    navigateTo(resolvePageId(location.hash));
  });

  navigateTo(resolvePageId(location.hash));
}

function initPhaseTabs() {
  document.querySelectorAll('.phase-tab').forEach((tab) => {
    tab.addEventListener('click', () => renderPhase(Number(tab.dataset.phase)));
  });
}

function initFilters() {
  document.getElementById('domain-filter')?.addEventListener('change', (e) => {
    renderCompetencies(e.target.value, document.getElementById('role-filter').value);
  });
  document.getElementById('role-filter')?.addEventListener('change', (e) => {
    renderCompetencies(document.getElementById('domain-filter').value, e.target.value);
  });
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

function initLangToggle() {
  document.getElementById('lang-toggle')?.addEventListener('click', switchLocale);
}

function init() {
  currentLocale = getStoredLocale();
  bundle = getLocaleBundle(currentLocale);
  initNavigation();
  initPhaseTabs();
  initFilters();
  initMobileNav();
  initLangToggle();
  try {
    renderAll();
  } catch (err) {
    console.error('[TPM] Render failed:', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
