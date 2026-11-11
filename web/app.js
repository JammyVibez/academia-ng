/**
 * Academia NG — phone-friendly web client.
 *
 * Dependency-free single page app for testing without Expo. Talks to the
 * Express API in /backend: auth, dashboard, course catalogue and enrolments.
 */
(function () {
  'use strict';

  const LEVEL_LABELS = {
    YEAR_1: '100 Level',
    YEAR_2: '200 Level',
    YEAR_3: '300 Level',
    YEAR_4: '400 Level',
    YEAR_5: '500 Level',
    YEAR_6: '600 Level',
    POSTGRADUATE: 'Postgraduate',
  };
  const LEVELS = Object.keys(LEVEL_LABELS);

  const TOKEN_KEY = 'academia.tokens';
  const USER_KEY = 'academia.user';
  const API_KEY = 'academia.api';
  const DEFAULT_API = 'http://localhost:4000/api';

  const root = document.getElementById('app');
  if (!root) return;

  /* ---------------------------------------------------------------- storage */

  function readJSON(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch (err) {
      return null;
    }
  }

  function writeJSON(key, value) {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  }

  const auth = {
    get tokens() {
      return readJSON(TOKEN_KEY);
    },
    set tokens(value) {
      writeJSON(TOKEN_KEY, value);
    },
    get user() {
      return readJSON(USER_KEY);
    },
    set user(value) {
      writeJSON(USER_KEY, value);
    },
    get apiBase() {
      return (localStorage.getItem(API_KEY) || DEFAULT_API).replace(/\/+$/, '');
    },
    set apiBase(value) {
      const clean = String(value || '').trim().replace(/\/+$/, '');
      localStorage.setItem(API_KEY, clean || DEFAULT_API);
    },
  };

  // ?api=https://my-api.vercel.app/api overrides the saved API address.
  const apiOverride = new URLSearchParams(location.search).get('api');
  if (apiOverride) auth.apiBase = apiOverride;

  /* ------------------------------------------------------------------ state */

  const state = {
    authMode: 'login',
    view: 'home',
    dashboard: null,
    courses: [],
    coursesLoaded: false,
    courseQuery: { search: '', academicLevel: '', semester: '', page: 1, totalPages: 1 },
    universities: null,
  };

  /* ------------------------------------------------------------------ utils */

  function esc(value) {
    return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function errorCard(message, retryId) {
    return (
      '<div class="card">' +
      '<div class="error">' + esc(message) + '</div>' +
      (retryId ? '<button class="btn btn-outline btn-sm" id="' + retryId + '">Try again</button>' : '') +
      '</div>'
    );
  }

  function setBusy(button, busy, label) {
    if (!button) return;
    button.disabled = !!busy;
    if (label) button.textContent = label;
  }

  let toastTimer = null;
  function toast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    document.body.appendChild(node);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      node.remove();
    }, 2600);
  }

  /* -------------------------------------------------------------------- api */

  function describeError(payload, status) {
    if (!payload) return 'Request failed (' + status + ')';
    const parts = [];
    if (payload.message) parts.push(payload.message);
    const details = payload.details;
    if (details && typeof details === 'object') {
      Object.keys(details).forEach(function (key) {
        const value = details[key];
        if (Array.isArray(value) && value.length) parts.push(key + ': ' + value.join(', '));
      });
    }
    return parts.join(' — ') || 'Request failed (' + status + ')';
  }

  async function refreshSession() {
    const tokens = auth.tokens;
    if (!tokens || !tokens.refreshToken) return false;
    try {
      const res = await fetch(auth.apiBase + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      if (!res.ok) return false;
      const payload = await res.json();
      const data = payload.data || {};
      if (!data.accessToken || !data.refreshToken) return false;
      auth.tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
      if (data.user) auth.user = data.user;
      return true;
    } catch (err) {
      return false;
    }
  }

  async function api(path, options) {
    const opts = options || {};
    const headers = { 'Content-Type': 'application/json' };
    const tokens = auth.tokens;
    if (opts.auth !== false && tokens && tokens.accessToken) {
      headers.Authorization = 'Bearer ' + tokens.accessToken;
    }

    let res;
    try {
      res = await fetch(auth.apiBase + path, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    } catch (err) {
      throw new Error('Cannot reach the API server at ' + auth.apiBase + '.');
    }

    if (res.status === 401 && opts.auth !== false && opts.retry !== false && (await refreshSession())) {
      return api(path, Object.assign({}, opts, { retry: false }));
    }

    let payload = null;
    try {
      payload = await res.json();
    } catch (err) {
      payload = null;
    }

    if (!res.ok) {
      if (res.status === 401 && opts.auth !== false) clearSession();
      throw new Error(describeError(payload, res.status));
    }

    return payload && payload.data !== undefined ? payload.data : payload;
  }

  function clearSession() {
    auth.tokens = null;
    auth.user = null;
    state.dashboard = null;
    state.courses = [];
    state.coursesLoaded = false;
    state.courseQuery.page = 1;
    state.courseQuery.totalPages = 1;
  }

  async function signOut() {
    const tokens = auth.tokens;
    clearSession();
    if (tokens && tokens.refreshToken) {
      fetch(auth.apiBase + '/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      }).catch(function () {});
    }
    state.authMode = 'login';
    render();
  }

  /* -------------------------------------------------------------- auth view */

  function setAuthError(message) {
    const box = document.getElementById('auth-error');
    if (box) box.innerHTML = message ? '<div class="error">' + esc(message) + '</div>' : '';
  }

  function renderAuth() {
    const register = state.authMode === 'register';

    root.innerHTML = `
      <div class="auth-screen">
        <div class="brand">
          <div class="brand-mark">A</div>
          <h1>Academia NG</h1>
          <p>${register ? 'Create your student account' : 'Your Nigerian university companion'}</p>
        </div>
        <div id="auth-error"></div>
        <form id="auth-form" novalidate>
          ${
            register
              ? `<div class="field"><label for="fullName">Full name</label>
                   <input id="fullName" name="fullName" autocomplete="name" required /></div>`
              : ''
          }
          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" inputmode="email" autocomplete="email" required />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" required />
          </div>
          ${
            register
              ? `<div class="field"><label for="universityId">University</label>
                   <select id="universityId" name="universityId" required>
                     <option value="">Loading…</option>
                   </select></div>
                 <div class="field"><label for="facultyId">Faculty</label>
                   <select id="facultyId" name="facultyId">
                     <option value="">Select university first</option>
                   </select></div>
                 <div class="field"><label for="departmentId">Department</label>
                   <select id="departmentId" name="departmentId">
                     <option value="">Select faculty first</option>
                   </select></div>
                 <div class="field"><label for="academicLevel">Level</label>
                   <select id="academicLevel" name="academicLevel">
                     ${LEVELS.map(function (level) {
                       return `<option value="${level}" ${level === 'YEAR_1' ? 'selected' : ''}>${LEVEL_LABELS[level]}</option>`;
                     }).join('')}
                   </select></div>`
              : ''
          }
          <button class="btn btn-primary" type="submit" id="auth-submit">${register ? 'Create account' : 'Sign in'}</button>
        </form>
        ${
          register
            ? ''
            : '<button class="btn btn-outline btn-gap" id="demo-login" type="button">Use demo account</button>'
        }
        <div class="link-row">
          ${
            register
              ? 'Already have an account? <a href="#" data-auth-mode="login">Sign in</a>'
              : 'New here? <a href="#" data-auth-mode="register">Create an account</a>'
          }
        </div>
        <details class="api-config">
          <summary>API server: ${esc(auth.apiBase)}</summary>
          <div class="field">
            <label for="api-input">Base URL</label>
            <input id="api-input" value="${esc(auth.apiBase)}" autocapitalize="none" spellcheck="false" />
          </div>
          <button class="btn btn-sm btn-outline" id="api-save" type="button">Save API address</button>
        </details>
      </div>`;

    const form = document.getElementById('auth-form');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (state.authMode === 'register') submitRegister(form);
      else submitLogin(form);
    });

    document.querySelectorAll('[data-auth-mode]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        state.authMode = link.getAttribute('data-auth-mode');
        render();
      });
    });

    const demo = document.getElementById('demo-login');
    if (demo) {
      demo.addEventListener('click', function () {
        form.email.value = 'demo@academia.ng';
        form.password.value = 'Student123';
        submitLogin(form);
      });
    }

    document.getElementById('api-save').addEventListener('click', function () {
      const value = document.getElementById('api-input').value;
      if (!value.trim()) {
        setAuthError('Enter the API base URL, for example http://localhost:4000/api');
        return;
      }
      auth.apiBase = value;
      clearSession();
      toast('API server saved');
      render();
    });

    if (register) wireSchoolPickers();
  }

  async function wireSchoolPickers() {
    const uniSelect = document.getElementById('universityId');
    const facSelect = document.getElementById('facultyId');
    const depSelect = document.getElementById('departmentId');

    const option = function (value, label) {
      return '<option value="' + esc(value) + '">' + esc(label) + '</option>';
    };

    try {
      if (!state.universities) {
        state.universities = await api('/auth/universities', { auth: false });
      }
      const universities = state.universities || [];
      if (!universities.length) {
        uniSelect.innerHTML = option('', 'No universities available');
        setAuthError('The API has no universities yet. Run the seed script (npm run seed) in /backend.');
        return;
      }
      uniSelect.innerHTML =
        option('', 'Select university') +
        universities.map(function (uni) {
          return option(uni.id, uni.shortName ? uni.shortName + ' — ' + uni.name : uni.name);
        }).join('');
    } catch (err) {
      uniSelect.innerHTML = option('', 'Could not load universities');
      setAuthError(err.message);
      return;
    }

    uniSelect.addEventListener('change', async function () {
      depSelect.innerHTML = option('', 'Select faculty first');
      if (!uniSelect.value) {
        facSelect.innerHTML = option('', 'Select university first');
        return;
      }
      facSelect.innerHTML = option('', 'Loading…');
      try {
        const faculties = await api(
          '/auth/universities/' + encodeURIComponent(uniSelect.value) + '/faculties',
          { auth: false }
        );
        facSelect.innerHTML =
          option('', faculties.length ? 'Select faculty (optional)' : 'No faculties listed') +
          (faculties || []).map(function (faculty) {
            return option(faculty.id, faculty.name);
          }).join('');
      } catch (err) {
        facSelect.innerHTML = option('', 'Could not load faculties');
        setAuthError(err.message);
      }
    });

    facSelect.addEventListener('change', async function () {
      if (!facSelect.value) {
        depSelect.innerHTML = option('', 'Select faculty first');
        return;
      }
      depSelect.innerHTML = option('', 'Loading…');
      try {
        const departments = await api(
          '/auth/faculties/' + encodeURIComponent(facSelect.value) + '/departments',
          { auth: false }
        );
        depSelect.innerHTML =
          option('', departments.length ? 'Select department (optional)' : 'No departments listed') +
          (departments || []).map(function (department) {
            return option(department.id, department.name);
          }).join('');
      } catch (err) {
        depSelect.innerHTML = option('', 'Could not load departments');
        setAuthError(err.message);
      }
    });
  }

  function afterSignIn(data) {
    auth.tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
    auth.user = data.user;
    state.dashboard = null;
    state.view = 'home';
    render();
  }

  async function submitLogin(form) {
    const button = document.getElementById('auth-submit');
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) {
      setAuthError('Enter your email and password.');
      return;
    }
    setAuthError('');
    setBusy(button, true, 'Signing in…');
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        auth: false,
        body: { email: email, password: password },
      });
      afterSignIn(data);
    } catch (err) {
      setAuthError(err.message);
      setBusy(button, false, 'Sign in');
    }
  }

  async function submitRegister(form) {
    const button = document.getElementById('auth-submit');
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const universityId = form.universityId.value;

    if (fullName.length < 2) return setAuthError('Enter your full name.');
    if (!email) return setAuthError('Enter your email address.');
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return setAuthError('Password must be at least 8 characters and include a letter and a number.');
    }
    if (!universityId) return setAuthError('Select your university.');

    setAuthError('');
    setBusy(button, true, 'Creating account…');
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        auth: false,
        body: {
          fullName: fullName,
          email: email,
          password: password,
          universityId: universityId,
          facultyId: form.facultyId.value || undefined,
          departmentId: form.departmentId.value || undefined,
          academicLevel: form.academicLevel.value,
        },
      });
      afterSignIn(data);
    } catch (err) {
      setAuthError(err.message);
      setBusy(button, false, 'Create account');
    }
  }

  /* ------------------------------------------------------------- app shell */

  function render() {
    const tokens = auth.tokens;
    if (tokens && tokens.accessToken) renderShell();
    else renderAuth();
  }

  function renderShell() {
    const profile = (state.dashboard && state.dashboard.profile) || auth.user || {};
    const university = profile.university || {};
    const firstName = String(profile.fullName || 'Student').split(' ')[0];
    const context = [
      university.shortName || university.name,
      profile.department && profile.department.name,
      profile.academicLevel ? LEVEL_LABELS[profile.academicLevel] : null,
    ]
      .filter(Boolean)
      .join(' · ');

    const tabs = [
      ['home', '🏠', 'Home'],
      ['learn', '📚', 'Learn'],
      ['profile', '👤', 'Profile'],
    ];

    root.innerHTML = `
      <div class="topbar">
        <h2>${greeting()}, ${esc(firstName)}</h2>
        <div class="sub">${esc(context || 'Finish setting up your profile')}</div>
      </div>
      <div class="content" id="view"></div>
      <nav class="nav">
        ${tabs
          .map(function (tab) {
            return `<button data-view="${tab[0]}" class="${state.view === tab[0] ? 'active' : ''}">
              <span class="icon">${tab[1]}</span>${tab[2]}
            </button>`;
          })
          .join('')}
      </nav>`;

    document.querySelectorAll('.nav button[data-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.view = button.getAttribute('data-view');
        renderShell();
      });
    });

    renderView();
  }

  function renderView() {
    const view = document.getElementById('view');
    if (!view) return;

    // Home, Learn and Profile all show academic context, so load it once.
    if (!state.dashboard) {
      view.innerHTML = '<div class="loading">Loading your dashboard…</div>';
      loadDashboard()
        .then(renderView)
        .catch(function (err) {
          view.innerHTML = errorCard(err.message, 'dashboard-retry');
          const retry = document.getElementById('dashboard-retry');
          if (retry) {
            retry.addEventListener('click', function () {
              state.dashboard = null;
              renderView();
            });
          }
        });
      return;
    }

    if (state.view === 'home') {
      view.innerHTML = homeHTML();
      wireEnrolButtons(view);
      return;
    }

    if (state.view === 'learn') {
      if (!state.coursesLoaded) {
        view.innerHTML = '<div class="loading">Loading courses…</div>';
        loadCourses(1, false)
          .then(renderView)
          .catch(function (err) {
            view.innerHTML = errorCard(err.message, 'courses-retry');
            const retry = document.getElementById('courses-retry');
            if (retry) {
              retry.addEventListener('click', function () {
                state.coursesLoaded = false;
                renderView();
              });
            }
          });
        return;
      }
      view.innerHTML = learnHTML();
      wireLearn(view);
      return;
    }

    view.innerHTML = profileHTML();
    wireProfile(view);
  }

  async function loadDashboard() {
    state.dashboard = await api('/courses/me/dashboard');
  }

  async function loadCourses(page, append) {
    const query = state.courseQuery;
    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.academicLevel) params.set('academicLevel', query.academicLevel);
    if (query.semester) params.set('semester', query.semester);
    params.set('page', String(page));
    params.set('limit', '20');

    const data = await api('/courses?' + params.toString());
    const items = (data && data.items) || [];
    state.courses = append ? state.courses.concat(items) : items;
    state.courseQuery.page = (data && data.pagination && data.pagination.page) || page;
    state.courseQuery.totalPages = (data && data.pagination && data.pagination.totalPages) || 1;
    state.coursesLoaded = true;
  }

  function registeredIds() {
    const courses = (state.dashboard && state.dashboard.registeredCourses) || [];
    return courses.map(function (course) {
      return course.id;
    });
  }

  function enrolButton(course, enrolled) {
    return enrolled
      ? `<button class="btn btn-sm btn-outline" data-unenrol="${esc(course.id)}">Enrolled</button>`
      : `<button class="btn btn-sm btn-primary" data-enrol="${esc(course.id)}">Enrol</button>`;
  }

  function courseCard(course, enrolled, withAction) {
    const meta = [
      course.department && course.department.name,
      course.academicLevel ? LEVEL_LABELS[course.academicLevel] : null,
      course.semester ? 'Semester ' + course.semester : null,
    ]
      .filter(Boolean)
      .map(esc)
      .join(' · ');

    return `
      <div class="card">
        <div class="course-row">
          <div class="info">
            <div class="card-label">${esc(course.code)} · ${esc(course.units)} unit${course.units === 1 ? '' : 's'}</div>
            <div class="card-title">${esc(course.title)}</div>
            ${meta ? `<div class="card-meta">${meta}</div>` : ''}
          </div>
          ${withAction ? enrolButton(course, enrolled) : ''}
        </div>
      </div>`;
  }

  /* -------------------------------------------------------------- home view */

  function homeHTML() {
    const dashboard = state.dashboard || {};
    const registered = dashboard.registeredCourses || [];
    const recommended = dashboard.recommendedCourses || [];
    const units = registered.reduce(function (total, course) {
      return total + (course.units || 0);
    }, 0);
    const enrolled = registeredIds();

    return `
      <div class="stats">
        <div class="card stat">
          <div class="stat-value">${registered.length}</div>
          <div class="stat-label">Courses registered</div>
        </div>
        <div class="card stat">
          <div class="stat-value">${units}</div>
          <div class="stat-label">Total units</div>
        </div>
      </div>

      <div class="section-title">Your courses</div>
      ${
        registered.length
          ? registered.map(function (course) {
              return courseCard(course, true, false);
            }).join('')
          : '<div class="empty">No registered courses yet. Open Learn to add your first course.</div>'
      }

      <div class="section-title">Recommended for you</div>
      ${
        recommended.length
          ? recommended.map(function (course) {
              return courseCard(course, enrolled.indexOf(course.id) !== -1, true);
            }).join('')
          : '<div class="empty">Set your university and level in Profile to get recommendations.</div>'
      }`;
  }

  /* ------------------------------------------------------------- learn view */

  function learnHTML() {
    const query = state.courseQuery;
    const enrolled = registeredIds();

    return `
      <input class="search" id="course-search" type="search" placeholder="Search course code or title"
        value="${esc(query.search)}" autocapitalize="none" spellcheck="false" />

      <div class="filter-row">
        <select id="filter-level" aria-label="Filter by level">
          <option value="">All levels</option>
          ${LEVELS.map(function (level) {
            return `<option value="${level}" ${query.academicLevel === level ? 'selected' : ''}>${LEVEL_LABELS[level]}</option>`;
          }).join('')}
        </select>
        <select id="filter-semester" aria-label="Filter by semester">
          <option value="">All semesters</option>
          ${[1, 2].map(function (semester) {
            return `<option value="${semester}" ${String(query.semester) === String(semester) ? 'selected' : ''}>Semester ${semester}</option>`;
          }).join('')}
        </select>
      </div>

      ${
        state.courses.length
          ? state.courses.map(function (course) {
              return courseCard(course, enrolled.indexOf(course.id) !== -1, true);
            }).join('')
          : '<div class="empty">No courses match those filters.</div>'
      }

      ${
        query.page < query.totalPages
          ? '<button class="btn btn-outline btn-gap" id="load-more" type="button">Load more courses</button>'
          : ''
      }`;
  }

  function wireLearn(view) {
    const search = document.getElementById('course-search');
    let searchTimer = null;
    search.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.courseQuery.search = search.value.trim();
        state.coursesLoaded = false;
        state.courseQuery.page = 1;
        loadCourses(1, false)
          .then(renderView)
          .catch(function (err) {
            toast(err.message);
            state.coursesLoaded = true;
            renderView();
          });
      }, 350);
    });

    document.getElementById('filter-level').addEventListener('change', function (event) {
      state.courseQuery.academicLevel = event.target.value;
      state.coursesLoaded = false;
      state.courseQuery.page = 1;
      loadCourses(1, false)
        .then(renderView)
        .catch(function (err) {
          toast(err.message);
          state.coursesLoaded = true;
          renderView();
        });
    });

    document.getElementById('filter-semester').addEventListener('change', function (event) {
      state.courseQuery.semester = event.target.value;
      state.coursesLoaded = false;
      state.courseQuery.page = 1;
      loadCourses(1, false)
        .then(renderView)
        .catch(function (err) {
          toast(err.message);
          state.coursesLoaded = true;
          renderView();
        });
    });

    const more = document.getElementById('load-more');
    if (more) {
      more.addEventListener('click', function () {
        setBusy(more, true, 'Loading…');
        loadCourses(state.courseQuery.page + 1, true)
          .then(renderView)
          .catch(function (err) {
            toast(err.message);
            setBusy(more, false, 'Load more courses');
          });
      });
    }

    wireEnrolButtons(view);
  }

  function wireEnrolButtons(scope) {
    scope.querySelectorAll('[data-enrol]').forEach(function (button) {
      button.addEventListener('click', function () {
        toggleEnrolment(button, button.getAttribute('data-enrol'), false);
      });
    });
    scope.querySelectorAll('[data-unenrol]').forEach(function (button) {
      button.addEventListener('click', function () {
        toggleEnrolment(button, button.getAttribute('data-unenrol'), true);
      });
    });
  }

  async function toggleEnrolment(button, courseId, isEnrolled) {
    setBusy(button, true, isEnrolled ? 'Removing…' : 'Enrolling…');
    try {
      if (isEnrolled) {
        await api('/courses/enroll/' + encodeURIComponent(courseId), { method: 'DELETE' });
      } else {
        await api('/courses/enroll', { method: 'POST', body: { courseId: courseId } });
      }
      await loadDashboard();
      state.coursesLoaded = false;
      state.courseQuery.page = 1;
      toast(isEnrolled ? 'Course removed' : 'Course added');
      renderShell();
    } catch (err) {
      toast(err.message);
      setBusy(button, false, isEnrolled ? 'Enrolled' : 'Enrol');
    }
  }

  /* ----------------------------------------------------------- profile view */

  function profileHTML() {
    const dashboard = state.dashboard || {};
    const profile = dashboard.profile || auth.user || {};
    const university = profile.university || {};
    const initial = String(profile.fullName || 'S').charAt(0).toUpperCase();

    const rows = [
      ['University', university.name || university.shortName],
      ['Faculty', profile.faculty && profile.faculty.name],
      ['Department', profile.department && profile.department.name],
      ['Level', profile.academicLevel ? LEVEL_LABELS[profile.academicLevel] : null],
      ['Semester', profile.currentSemester ? 'Semester ' + profile.currentSemester : null],
    ];

    return `
      <div class="card profile-head">
        <div class="avatar">${esc(initial)}</div>
        <div class="info">
          <div class="card-title">${esc(profile.fullName || 'Student')}</div>
          <div class="card-meta">${esc(profile.email || '')}</div>
        </div>
      </div>

      <div class="section-title">Academic details</div>
      <div class="card">
        ${rows
          .map(function (row) {
            return `<div class="detail-row">
              <span class="label">${esc(row[0])}</span>
              <span class="value">${esc(row[1] || 'Not set')}</span>
            </div>`;
          })
          .join('')}
      </div>

      <div class="section-title">Account</div>
      <div class="card">
        <form id="name-form" class="name-form">
          <input id="profile-name" name="fullName" value="${esc(profile.fullName || '')}" aria-label="Full name" />
          <button class="btn btn-sm btn-primary" type="submit" id="name-save">Save</button>
        </form>
        <div class="card-meta">Update how your name appears across the app.</div>
      </div>

      <div class="card">
        <div class="card-label">API server</div>
        <div class="card-meta">${esc(auth.apiBase)}</div>
        <form id="api-form" class="name-form" style="margin-top:10px">
          <input id="profile-api" value="${esc(auth.apiBase)}" aria-label="API base URL" autocapitalize="none" spellcheck="false" />
          <button class="btn btn-sm btn-outline" type="submit">Change</button>
        </form>
      </div>

      <button class="btn btn-outline btn-gap" id="sign-out" type="button">Log out</button>`;
  }

  function wireProfile(view) {
    const nameForm = document.getElementById('name-form');
    nameForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const input = document.getElementById('profile-name');
      const button = document.getElementById('name-save');
      const fullName = input.value.trim();
      if (fullName.length < 2) {
        toast('Enter your full name');
        return;
      }
      setBusy(button, true, 'Saving…');
      try {
        const updated = await api('/auth/me', { method: 'PATCH', body: { fullName: fullName } });
        auth.user = updated;
        if (state.dashboard && state.dashboard.profile) {
          state.dashboard.profile = Object.assign({}, state.dashboard.profile, {
            fullName: updated.fullName || fullName,
          });
        }
        toast('Profile updated');
        renderShell();
      } catch (err) {
        toast(err.message);
        setBusy(button, false, 'Save');
      }
    });

    const apiForm = document.getElementById('api-form');
    apiForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const value = document.getElementById('profile-api').value.trim();
      if (!value) {
        toast('Enter the API base URL');
        return;
      }
      auth.apiBase = value;
      clearSession();
      toast('API server changed — sign in again');
      state.authMode = 'login';
      render();
    });

    document.getElementById('sign-out').addEventListener('click', signOut);
  }

  /* ------------------------------------------------------------------ start */

  render();
})();
