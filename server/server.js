const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default; // Note: .default is important here

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allows frontend (port 5173) to talk to backend (port 3000)
app.use(express.json());

// In-memory storage for scan results
const jobCache = new Map();

// --- Helper Functions ---

function calculateScore(violations) {
  const weights = { minor: 1, moderate: 2, serious: 5, critical: 10 };
  let penalty = 0;
  violations.forEach(v => {
    // Cap penalties per issue type to prevent 0 score from one repeated error
    const occurrences = Math.min(v.nodes.length, 5); 
    penalty += (weights[v.impact] || 1) * occurrences;
  });
  return Math.max(0, 100 - penalty);
}

function getNonprofitExplanation(id, help) {
  const dict = {
    'image-alt': 'Images are missing descriptions. Blind users using screen readers won\'t know what these images show.',
    'color-contrast': 'The text color is too light against the background, making it hard to read for people with low vision.',
    'label': 'Form inputs (like email or search) are missing labels. Screen readers can\'t tell users what to type here.',
    'link-name': 'Links labeled "click here" or empty icons provide no context about where they lead.',
    'heading-order': 'Headings are skipped (e.g. H1 to H4), which breaks the "Table of Contents" structure of the page.'
  };
  return dict[id] || `${help}. This creates barriers for assistive technology users.`;
}

// --- Routes ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.post('/api/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const scanId = Math.random().toString(36).substring(7);
  jobCache.set(scanId, { id: scanId, status: 'processing' });
  
  // Start async scan (don't await)
  runAudit(scanId, url);
  
  res.json({ scanId, message: 'Scan started' });
});

app.get('/api/report/:id', (req, res) => {
  const result = jobCache.get(req.params.id);
  if (!result) return res.status(404).json({ error: 'Job not found' });
  res.json(result);
});

// --- Audit Logic ---

async function runAudit(scanId, rawUrl) {
  let browser;
  try {
    const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    console.log(`[${scanId}] Scanning: ${url}`);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = results.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      title: v.help,
      description: v.description,
      helpUrl: v.helpUrl,
      elements: v.nodes.map(n => n.target.join(' ')),
      wcag: v.tags.filter(t => t.startsWith('wcag')).map(t => t.replace('wcag', '')),
      fixRecommendation: `See: ${v.helpUrl}`,
      nonprofitExplanation: getNonprofitExplanation(v.id, v.help)
    }));

    const report = {
      id: scanId,
      url: url,
      timestamp: new Date().toISOString(),
      lighthouseScore: calculateScore(violations),
      violations: violations,
      status: 'completed'
    };

    jobCache.set(scanId, report);
    console.log(`[${scanId}] Success.`);

  } catch (error) {
    console.error(`[${scanId}] Error:`, error.message);
    jobCache.set(scanId, { id: scanId, status: 'failed', error: error.message });
  } finally {
    if (browser) await browser.close();
  }
}

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

