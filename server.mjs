/**
 * $COACH Buy-and-Burn Webhook Server
 * 
 * Receives payment notifications and triggers automated buy-and-burn.
 * 
 * Endpoints:
 *   POST /webhook/payment  — Stripe webhook (or manual trigger)
 *   POST /burn             — Manual burn trigger (amount in body)
 *   GET  /burns            — List all burns from log
 *   GET  /health           — Health check
 * 
 * Usage:
 *   node server.mjs [--port 3120]
 */

import http from 'http';
import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.argv.find((_, i, a) => a[i-1] === '--port') || '3120');
const BURN_SCRIPT = path.join(__dirname, 'buy-and-burn.sh');
const LOG_FILE = path.join(__dirname, 'burn-log.jsonl');
const API_KEY = process.env.COACH_BURN_API_KEY || 'coach-burn-dev-key';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function getBurns() {
  if (!fs.existsSync(LOG_FILE)) return [];
  return fs.readFileSync(LOG_FILE, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);
}

function triggerBurn(amountUsd) {
  return new Promise((resolve, reject) => {
    console.log(`🔥 Triggering burn for $${amountUsd}...`);
    exec(`bash "${BURN_SCRIPT}" ${amountUsd}`, { timeout: 300000 }, (err, stdout, stderr) => {
      if (err) {
        console.error(`Burn error: ${stderr || err.message}`);
        reject(err);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Health check
    if (req.method === 'GET' && url.pathname === '/health') {
      const burns = getBurns();
      const totalBurned = burns
        .filter(b => b.status === 'success')
        .reduce((sum, b) => sum + (b.amount_usd || 0), 0);
      res.end(JSON.stringify({
        status: 'ok',
        service: 'coach-burn',
        totalBurns: burns.filter(b => b.status === 'success').length,
        totalUsdBurned: totalBurned,
        token: '0x3DD9abA16702b35B448dca55A6EA1fa49EEfD39B',
        burnAddress: '0x000000000000000000000000000000000000dEaD'
      }));
      return;
    }

    // List burns
    if (req.method === 'GET' && url.pathname === '/burns') {
      res.end(JSON.stringify({ burns: getBurns() }));
      return;
    }

    // Manual burn trigger
    if (req.method === 'POST' && url.pathname === '/burn') {
      const body = JSON.parse(await readBody(req));
      const authHeader = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
      if (authHeader !== API_KEY) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      const amount = body.amount_usd || 20;
      triggerBurn(amount).catch(console.error); // fire and forget
      res.end(JSON.stringify({ status: 'burn_triggered', amount_usd: amount }));
      return;
    }

    // Stripe webhook
    if (req.method === 'POST' && url.pathname === '/webhook/payment') {
      const body = JSON.parse(await readBody(req));
      // Stripe sends checkout.session.completed or invoice.payment_succeeded
      const type = body.type || body.event_type;
      if (type === 'checkout.session.completed' || type === 'invoice.payment_succeeded') {
        const amount = (body.data?.object?.amount_total || 2000) / 100; // cents to dollars
        console.log(`💰 Payment received: $${amount} — triggering burn`);
        triggerBurn(amount).catch(console.error);
        res.end(JSON.stringify({ received: true, burn_triggered: true, amount_usd: amount }));
      } else {
        res.end(JSON.stringify({ received: true, burn_triggered: false, event_type: type }));
      }
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`🔥 $COACH Buy-and-Burn server running on port ${PORT}`);
  console.log(`   POST /webhook/payment  — Stripe webhook`);
  console.log(`   POST /burn             — Manual trigger`);
  console.log(`   GET  /burns            — Burn history`);
  console.log(`   GET  /health           — Status`);
});
