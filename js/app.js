/**
 * Główna aplikacja — renderowanie i nawigacja SPA.
 * Rozszerzaj: dodaj moduły w js/modules/ i importuj tutaj.
 */

import {
  config,
  overviewCards,
  roles,
  roleLabels,
  trainingMatrix,
  trainingHours,
  competencyDomains,
  phases,
  artifacts,
  readinessChecklist,
} from './data/content.js';

const STORAGE_KEY = 'tpm-checklist-v1';

/** @param {string} level */
function levelBadge(level) {
  if (!level || level === '—') {
    return '<span class="level-badge na">—</span>';
  }
  const cls = level.toLowerCase();
  return `<span class="level-badge ${cls}">${level}</span>`;
}

function renderOverview() {
  document.getElementById('app-version').textContent = config.version;

  const cardsEl = document.getElementById('overview-cards');
  cardsEl.innerHTML = overviewCards
    .map(
      (c) => `
    <article class="card">
      <div class="card-icon" aria-hidden="true">${c.icon}</div>
      <h3>${c.title}</h3>
      <p>${c.description}</p>
    </article>`
    )
    .join('');

  const assumptionsEl = document.getElementById('assumptions-list');
  const entries = Object.entries(config.pilot);
  const labels = {
    scope: 'Zakres',
    duration: 'Czas',
    model: 'Model',
    goal: 'Cel okresu',
  };
  assumptionsEl.innerHTML = entries
    .map(([key, val]) => `<div><dt>${labels[key] || key}</dt><dd>${val}</dd></div>`)
    .join('');
}

function renderRoles() {
  const tbody = document.querySelector('#roles-table tbody');
  tbody.innerHTML = roles
    .map(
      (r) => `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td><code>${r.id}</code></td>
      <td>${r.count}</td>
      <td>${r.responsibility}</td>
    </tr>`
    )
    .join('');

  document.querySelector('#training-matrix tbody').innerHTML = trainingMatrix
    .map(
      (t) => `
    <tr>
      <td>${t.area}</td>
      <td>${t.trainer}</td>
      <td>${t.backup}</td>
      <td>${t.recipients}</td>
    </tr>`
    )
    .join('');

  document.querySelector('#training-hours tbody').innerHTML = trainingHours
    .map(
      (t) => `
    <tr>
      <td>${t.role}</td>
      <td>${t.phase1}</td>
      <td>${t.phase2}</td>
      <td>${t.phase3}</td>
      <td><strong>${t.total}</strong></td>
    </tr>`
    )
    .join('');
}

function renderCompetencies(filterDomain = 'all', filterRole = 'all') {
  const domainSelect = document.getElementById('domain-filter');
  const roleSelect = document.getElementById('role-filter');

  if (domainSelect.options.length <= 1) {
    competencyDomains.forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.name.replace(/^\d+\.\s*/, '');
      domainSelect.appendChild(opt);
    });
    Object.entries(roleLabels).forEach(([id, label]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = label;
      roleSelect.appendChild(opt);
    });
  }

  const roleIds = Object.keys(roleLabels);
  const container = document.getElementById('competency-domains');

  const filtered = competencyDomains.filter((d) => filterDomain === 'all' || d.id === filterDomain);

  container.innerHTML = filtered
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
            <thead><tr><th>Kompetencja</th>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
    })
    .join('');
}

function renderPhase(phaseId) {
  const phase = phases.find((p) => p.id === phaseId);
  if (!phase) return;

  document.getElementById('phase-summary').innerHTML = `
    <h3>${phase.title} · ${phase.days}</h3>
    <p><strong>Cel:</strong> ${phase.goal}</p>
  `;

  document.getElementById('timeline').innerHTML = phase.weeks
    .map(
      (w) => `
    <details class="week-card">
      <summary>
        <span class="week-num">T${w.week}</span>
        Tydzień ${w.week}
      </summary>
      <div class="week-body">
        <div class="week-grid">
          <div>
            <h4>Działania</h4>
            <ul>${w.actions.map((a) => `<li>${a}</li>`).join('')}</ul>
          </div>
          <div>
            <h4>Kompetencje (cel)</h4>
            <ul>${w.competencies.map((c) => `<li>${c}</li>`).join('')}</ul>
          </div>
          <div>
            <h4>Deliverable</h4>
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
  document.querySelector('#artifacts-table tbody').innerHTML = artifacts
    .map(
      (a) => `
    <tr>
      <td>${a.name}</td>
      <td>${a.deadline}</td>
      <td>${a.owner}</td>
    </tr>`
    )
    .join('');

  renderPhase(1);
}

function renderKpi() {
  document.getElementById('kpi-phases').innerHTML = phases
    .map(
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
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecklistState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateChecklistProgress() {
  const boxes = document.querySelectorAll('#readiness-checklist input[type="checkbox"]');
  const checked = [...boxes].filter((b) => b.checked).length;
  const total = boxes.length;
  const pct = total ? Math.round((checked / total) * 100) : 0;

  document.getElementById('checklist-progress-fill').style.width = `${pct}%`;
  document.getElementById('checklist-progress-text').textContent = `${checked} / ${total} ukończonych`;

  const bar = document.querySelector('.progress-bar');
  bar?.setAttribute('aria-valuenow', String(pct));

  const resultEl = document.getElementById('checklist-result');
  if (checked === 0) {
    resultEl.hidden = true;
    return;
  }

  resultEl.hidden = false;
  if (checked >= 4) {
    resultEl.className = 'checklist-result success';
    resultEl.textContent =
      `${checked}× Tak — gotowość do skalowania na linię #2. Utrwal standardy i przenieś wzorce.`;
  } else {
    resultEl.className = 'checklist-result warning';
    resultEl.textContent =
      `${checked}× Tak — przedłuż pilot o 30 dni. Skup się na lukach przed skalowaniem.`;
  }
}

function renderChecklist() {
  const state = loadChecklistState();
  const list = document.getElementById('readiness-checklist');

  list.innerHTML = readinessChecklist
    .map((item, i) => {
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
      localStorage.removeItem(STORAGE_KEY);
      renderChecklist();
    });
  }

  updateChecklistProgress();
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

function initNavigation() {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });

  window.addEventListener('popstate', (e) => {
    const page = e.state?.page || location.hash.slice(1) || 'home';
    navigateTo(page);
  });

  const initial = location.hash.slice(1) || 'home';
  const valid = ['home', 'roles', 'competencies', 'plan', 'kpi', 'checklist'];
  navigateTo(valid.includes(initial) ? initial : 'home');
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

function init() {
  renderOverview();
  renderRoles();
  renderCompetencies();
  renderPlan();
  renderKpi();
  renderChecklist();
  initNavigation();
  initPhaseTabs();
  initFilters();
  initMobileNav();
}

document.addEventListener('DOMContentLoaded', init);
