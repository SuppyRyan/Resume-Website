// Deploys the portfolio once Vercel's daily deployment limit frees up, then removes its own scheduled
// task ("Portfolio deploy when ready", hourly). Git pushes that hit the limit are not retried by
// Vercel, so without this a finished change could sit undeployed until the next unrelated push.
//
// Done means: the live site serves the same pages, styles and script as this folder. Otherwise it
// runs `vercel deploy --prod` (the folder is linked to the ryan-lin project in .vercel/).
// Every run appends one line to tools/deploy-log.txt (gitignored).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ryan-lin.vercel.app';
const TASK = 'Portfolio deploy when ready';
const log = msg => fs.appendFileSync(path.join(ROOT, 'tools', 'deploy-log.txt'), `${new Date().toISOString()} ${msg}\n`);
const norm = s => s.replace(/\r\n/g, '\n').trim();

async function liveMatches() {
  for (const [url, file] of [['/', 'index.html'], ['/work', 'work.html'], ['/styles.css', 'styles.css'], ['/main.js', 'main.js']]) {
    const r = await fetch(SITE + url, { cache: 'no-store' });
    if (!r.ok || norm(await r.text()) !== norm(fs.readFileSync(path.join(ROOT, file), 'utf8'))) return false;
  }
  return (await fetch(SITE + '/HANDOFF.md', { cache: 'no-store' })).status === 404;
}

const done = () => { try { execSync(`schtasks /delete /tn "${TASK}" /f`, { stdio: 'ignore' }); } catch {} };
try {
  if (await liveMatches()) { log('live site is current; removing the task'); done(); process.exit(0); }
  const out = execSync('npx --yes vercel@latest deploy --prod --yes', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 600000 });
  log('deployed: ' + (out.match(/https:\/\/\S+/) || ['(no url in output)'])[0]);
  if (await liveMatches()) { log('verified live; removing the task'); done(); }
} catch (e) {
  const msg = String(e.stderr || e.stdout || e.message);
  log(/limited|api-deployments-free-per-day/.test(msg) ? 'still over the daily deploy limit; retrying next hour' : 'failed: ' + msg.split('\n').filter(Boolean).slice(-2).join(' | '));
}
