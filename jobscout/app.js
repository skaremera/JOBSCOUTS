/**
 * JobScout - remote job search app.
 * Uses the free, public Remotive API (no key required):
 * https://remotive.com/api/remote-jobs
 *
 * Shared Express app: server.js runs it locally, api/index.js exposes it
 * to Vercel's serverless Node runtime.
 */

'use strict';

const express = require('express');
const path = require('path');

const app = express();
const REMOTIVE_BASE = 'https://remotive.com/api/remote-jobs';
const UPSTREAM_TIMEOUT_MS = 8000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'jobscout' }));

app.get('/api/jobs', async (req, res) => {
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
      return res.status(429).json({ error: 'Remotive rate limit reached. Please wait a moment and try again.' });
    }
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Remotive API returned an unexpected error (HTTP ${upstream.status}).` });
    }

    const data = await upstream.json();
    const jobs = (data.jobs || []).map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company_name,
      companyLogo: j.company_logo,
      category: j.category,
      jobType: j.job_type,
      location: j.candidate_required_location,
      salary: j.salary || '',
      publishedAt: j.publication_date,
      url: j.url,
      tags: j.tags || [],
    }));

    res.json({ jobs, total: data['job-count'] || jobs.length });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Remotive API timed out. Please try again shortly.' });
    }
    res.status(502).json({ error: 'Could not reach the Remotive API. Check your connection and try again.' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

module.exports = app;

