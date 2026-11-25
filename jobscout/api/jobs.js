'use strict';

const REMOTIVE_BASE = 'https://remotive.com/api/remote-jobs';
const UPSTREAM_TIMEOUT_MS = 8000;

module.exports = async (req, res) => {
  const search = (req.query.search || '').trim();
  const category = (req.query.category || '').trim();
  const limit = Math.min(parseInt(req.query.limit, 10) || 40, 100);

  
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  params.set('limit', String(limit));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${REMOTIVE_BASE}?${params.toString()}`, { signal: controller.signal });
    clearTimeout(timeout);

    if (upstream.status === 429) {
      res.status(429).json({ error: 'Remotive rate limit reached. Please wait a moment and try again.' });
      return;
    }
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Remotive API returned an unexpected error (HTTP ${upstream.status}).` });
      return;
    }

    const data = await upstream.json();
    const jobs = (data.jobs || []).map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company_name,
      category: j.category,
      jobType: j.job_type,
      location: j.candidate_required_location,
      salary: j.salary || '',
      publishedAt: j.publication_date,
      url: j.url,
      tags: j.tags || [],
    }));

    res.status(200).json({ jobs, total: data['job-count'] || jobs.length });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      res.status(504).json({ error: 'Remotive API timed out. Please try again shortly.' });
      return;
    }
    res.status(502).json({ error: 'Could not reach the Remotive API. Check your connection and try again.' });
  }
};
