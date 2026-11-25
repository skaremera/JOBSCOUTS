(function () {
  'use strict';
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  const sortSelect = document.getElementById('sort-select');
  const searchBtn = document.getElementById('search-btn');
  const statusEl = document.getElementById('status');
  const resultsEl = document.getElementById('results');

  let jobs = []; 
  
  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status' + (type ? ' ' + type : '');
  }

  function escapeHTML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async function search() {
    setStatus('Searching…');
    resultsEl.innerHTML = '';
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
    if (categorySelect.value) params.set('category', categorySelect.value);

    try {
      const res = await fetch('/api/jobs?' + params.toString());
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Request failed.');
      jobs = body.jobs || [];
      if (jobs.length === 0) {
        setStatus('No jobs found. Try a different keyword or category.', 'error');
        return;
      }
      setStatus(`${jobs.length} job(s) found.`);
      render();
    } catch (err) {
      setStatus(err.message || 'Something went wrong.', 'error');
    }
  }

  function render() {
    const sorted = jobs.slice().sort((a, b) => {
      if (sortSelect.value === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortSelect.value === 'company') return (a.company || '').localeCompare(b.company || '');
      const da = new Date(a.publishedAt).getTime();
      const db = new Date(b.publishedAt).getTime();
      return sortSelect.value === 'date-asc' ? da - db : db - da;
    });

    resultsEl.innerHTML = sorted.map((j) => `
      <article class="job-card">
        <h3 class="job-title"><a href="${escapeHTML(j.url)}" target="_blank" rel="noopener">${escapeHTML(j.title)}</a></h3>
        <div class="job-meta">${escapeHTML(j.company)} · ${escapeHTML(j.location || 'Anywhere')} · ${escapeHTML(j.jobType || '')} ${j.salary ? '· ' + escapeHTML(j.salary) : ''}</div>
        <div class="job-tags">${(j.tags || []).slice(0, 6).map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>
      </article>
    `).join('');
  }

  searchBtn.addEventListener('click', search);
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(); });
  categorySelect.addEventListener('change', search);
  sortSelect.addEventListener('change', () => jobs.length && render());

  search(); // initial load
})();
