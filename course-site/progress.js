// =====================================================
// Course state — theme + language + completion + quiz scoring
// All in localStorage under a single key.
// =====================================================

(function () {
    const STORAGE_KEY = 'claude-code-course-v1';

    const ETAPES = [
        'etap-00', 'etap-01', 'etap-02', 'etap-03', 'etap-04',
        'etap-05', 'etap-06', 'etap-07', 'etap-08a', 'etap-08b',
        'etap-09', 'etap-10', 'etap-11', 'capstone'
    ];

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }
    function save(s) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
    }

    const state = load();
    const urlParams = new URLSearchParams(location.search);
    const printMode = urlParams.get('print') === '1';
    const forcedLang = urlParams.get('lang');
    if (!state.theme) state.theme = 'doodle';
    if (!state.lang) state.lang = (navigator.language || 'ru').toLowerCase().startsWith('en') ? 'en' : 'ru';
    if (forcedLang === 'ru' || forcedLang === 'en') state.lang = forcedLang;
    if (printMode) state.theme = 'light';
    if (!state.done) state.done = {};
    if (!state.checks) state.checks = {};
    if (!state.scores) state.scores = {};
    save(state);

    if (printMode) {
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('details').forEach(d => d.setAttribute('open', ''));
        });
    }

    // ----- THEME -----
    const THEME_CYCLE = { light: 'dark', dark: 'doodle', doodle: 'light' };
    const THEME_VIEW = {
        light:  { label: 'DAY',    glyph: '☼' },
        dark:   { label: 'NIGHT',  glyph: '☾' },
        doodle: { label: 'DOODLE', glyph: '❀' }
    };
    function applyTheme() {
        document.body.classList.remove('dark', 'doodle');
        if (state.theme === 'dark' || state.theme === 'doodle') {
            document.body.classList.add(state.theme);
        }
        const btn = document.querySelector('.theme-toggle');
        if (btn) {
            const view = THEME_VIEW[state.theme] || THEME_VIEW.light;
            btn.setAttribute('aria-pressed', String(state.theme !== 'light'));
            const lab = btn.querySelector('.theme-label');
            const gly = btn.querySelector('.theme-glyph');
            if (lab) lab.textContent = view.label;
            if (gly) gly.textContent = view.glyph;
        }
    }
    function toggleTheme() {
        state.theme = THEME_CYCLE[state.theme] || 'light';
        save(state); applyTheme();
    }

    // ----- LANGUAGE -----
    function applyLang() {
        document.documentElement.setAttribute('lang', state.lang);
        document.querySelectorAll('.lang-toggle button').forEach(b => {
            b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang));
        });
        renderQuizSummary();
    }
    function bindLangToggle() {
        document.querySelectorAll('.lang-toggle button').forEach(b => {
            b.addEventListener('click', () => {
                state.lang = b.dataset.lang;
                save(state); applyLang();
            });
        });
    }

    // ----- ETAPE COMPLETION -----
    function markEtape(id, done) {
        state.done[id] = !!done;
        save(state);
        renderProgressPill(); renderEtapeRowState(); renderCompleteButton();
    }
    function renderProgressPill() {
        const pill = document.querySelector('.progress-pill');
        if (!pill) return;
        const total = ETAPES.length;
        const done = ETAPES.filter(id => state.done[id]).length;
        const numEl = pill.querySelector('.num');
        const totEl = pill.querySelector('.total');
        if (numEl) numEl.textContent = done;
        if (totEl) totEl.textContent = total;
    }
    function renderEtapeRowState() {
        document.querySelectorAll('.etap-row[data-id]').forEach(r => {
            r.classList.toggle('done', !!state.done[r.dataset.id]);
        });
    }
    function renderCompleteButton() {
        const btn = document.querySelector('.btn-complete');
        if (!btn) return;
        const id = btn.dataset.id;
        const isDone = !!state.done[id];
        btn.classList.toggle('is-done', isDone);
        const ru = btn.querySelector('[lang="ru"]');
        const en = btn.querySelector('[lang="en"]');
        if (ru) ru.textContent = isDone ? 'Этап завершён' : 'Отметить этап завершённым';
        if (en) en.textContent = isDone ? 'Etape completed' : 'Mark etape complete';
    }
    function bindCompleteButton() {
        const btn = document.querySelector('.btn-complete');
        if (!btn) return;
        btn.addEventListener('click', () => markEtape(btn.dataset.id, !state.done[btn.dataset.id]));
    }

    // ----- CHECKLIST -----
    function renderChecks() {
        document.querySelectorAll('.checklist li[data-key]').forEach(li => {
            li.classList.toggle('done', !!state.checks[li.dataset.key]);
        });
    }
    function bindChecks() {
        document.querySelectorAll('.checklist li[data-key]').forEach(li => {
            li.addEventListener('click', () => {
                const k = li.dataset.key;
                state.checks[k] = !state.checks[k];
                save(state); li.classList.toggle('done', !!state.checks[k]);
            });
        });
    }

    // ----- QUIZ SCORING -----
    function renderQuizScores() {
        document.querySelectorAll('.quiz-item').forEach((item, idx) => {
            const key = item.dataset.q || ('q' + (idx + 1));
            const score = state.scores[key];
            item.querySelectorAll('.score-btn').forEach(b => {
                b.classList.toggle('is-active', b.dataset.score === score);
            });
        });
        renderQuizSummary();
    }
    function bindQuizScores() {
        document.querySelectorAll('.quiz-item').forEach((item, idx) => {
            const key = item.dataset.q || ('q' + (idx + 1));
            item.querySelectorAll('.score-btn').forEach(b => {
                b.addEventListener('click', () => {
                    if (state.scores[key] === b.dataset.score) {
                        delete state.scores[key];
                    } else {
                        state.scores[key] = b.dataset.score;
                    }
                    save(state); renderQuizScores();
                });
            });
        });
    }
    function renderQuizSummary() {
        const summary = document.querySelector('.quiz-summary');
        if (!summary) return;
        const items = document.querySelectorAll('.quiz-item');
        if (!items.length) return;
        let known = 0, unknown = 0;
        const unanswered = [];
        items.forEach((item, idx) => {
            const key = item.dataset.q || ('q' + (idx + 1));
            const score = state.scores[key];
            const num = String(idx + 1).padStart(2, '0');
            if (score === 'known') known++;
            else if (score === 'unknown') { unknown++; unanswered.push(num); }
        });
        const total = items.length;
        const answered = known + unknown;
        const lang = state.lang || 'ru';

        const knownEl = summary.querySelector('.stat-known .num');
        const unknownEl = summary.querySelector('.stat-unknown .num');
        const totalEl = summary.querySelector('.stat-total .num');
        if (knownEl) knownEl.textContent = known;
        if (unknownEl) unknownEl.textContent = unknown;
        if (totalEl) totalEl.textContent = total;

        // labels in correct language
        summary.querySelectorAll('[data-i18n-stat]').forEach(el => {
            const labels = {
                known:   { ru: 'знал',         en: 'knew' },
                unknown: { ru: 'не знал',      en: 'did not know' },
                total:   { ru: 'всего',        en: 'total' }
            };
            const t = el.dataset.i18nStat;
            if (labels[t]) el.textContent = labels[t][lang];
        });

        const heading = summary.querySelector('.quiz-heading');
        if (heading) {
            heading.textContent = lang === 'ru'
                ? 'Куда дальше?'
                : 'Where to next?';
        }

        let advice;
        if (answered === 0) {
            advice = lang === 'ru'
                ? 'Оцените каждый вопрос — нажмите «знал» или «не знал» под раскрытым ответом. Тогда я подскажу, что повторить.'
                : 'Rate each question — press “knew” or “did not know” under the revealed answer. Then I will suggest what to review.';
        } else if (answered < total) {
            advice = lang === 'ru'
                ? 'Оценено ' + answered + ' из ' + total + '. Дооцените оставшиеся вопросы — иначе совет будет неполным.'
                : answered + ' of ' + total + ' rated. Rate the remaining questions — otherwise the advice will be incomplete.';
        } else if (unknown === 0) {
            advice = lang === 'ru'
                ? '<strong>Все семь вопросов закрыты уверенно.</strong> Этап освоен. Можно переходить к следующему — нажмите «Отметить этап завершённым» ниже.'
                : '<strong>All seven answered with confidence.</strong> Etape mastered. Move on to the next one — press “Mark etape complete” below.';
        } else if (unknown <= 2) {
            advice = lang === 'ru'
                ? '<strong>Почти готовы.</strong> Перечитайте темы № ' + unanswered.join(', ') + ' в § I — это закроет последние пробелы за 10–15 минут, и можно идти дальше.'
                : '<strong>Almost there.</strong> Re-read topics #' + unanswered.join(', ') + ' in § I — that closes the gaps in 10–15 minutes, then move on.';
        } else {
            advice = lang === 'ru'
                ? '<strong>Стоит закрепить.</strong> Вопросы № ' + unanswered.join(', ') + ' пока «не знал» — вернитесь в § I и пройдите соответствующие темы заново. Идти дальше с пробелами труднее, чем кажется.'
                : '<strong>Worth reinforcing.</strong> Questions #' + unanswered.join(', ') + ' are still “did not know” — return to § I and re-read those topics. Pressing on with gaps is harder than it looks.';
        }
        const adv = summary.querySelector('.advice');
        if (adv) adv.innerHTML = advice;
    }

    // ----- INIT -----
    function init() {
        applyTheme();
        applyLang();

        const tBtn = document.querySelector('.theme-toggle');
        if (tBtn) tBtn.addEventListener('click', toggleTheme);

        bindLangToggle();

        renderProgressPill();
        renderEtapeRowState();
        renderCompleteButton();
        bindCompleteButton();

        renderChecks();
        bindChecks();

        renderQuizScores();
        bindQuizScores();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }
})();
