/**
 * High-Throughput Recipe Image CDN Validator
 * Performs rapid HTTP HEAD requests against Food.com CDN to check for 200 OK,
 * and bulk-updates valid records to has_valid_image = true.
 * Concurrency limited to 50 concurrent requests.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Parse .env if present
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[Validator Error] Missing SUPABASE_URL or SUPABASE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 60,
  timeout: 5000,
});

const CONCURRENCY_LIMIT = 50;
const BATCH_SIZE = 500;

function checkImageHead(url) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const req = https.request(
        {
          hostname: parsedUrl.hostname,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'HEAD',
          agent: httpsAgent,
          timeout: 4000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (CDN-Validator/1.0)',
            Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
          },
        },
        (res) => {
          resolve(res.statusCode === 200);
          res.resume();
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.on('error', () => resolve(false));
      req.end();
    } catch {
      resolve(false);
    }
  });
}

async function processChunkWithConcurrency(items, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      const item = items[i];
      const isValid = await checkImageHead(item.image_url);
      results.push({ id: item.id, isValid });
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function runValidation() {
  console.log('--- STARTING RECIPE CDN IMAGE VALIDATION ENGINE ---');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`Concurrency Limit: ${CONCURRENCY_LIMIT}\n`);

  let totalChecked = 0;
  let totalValidated = 0;
  let lastId = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('id, image_url')
      .eq('has_valid_image', false)
      .not('image_url', 'is', null)
      .gt('id', lastId)
      .order('id', { ascending: true })
      .limit(BATCH_SIZE);

    if (error) {
      console.error('[Query Error]:', error.message);
      break;
    }

    if (!recipes || recipes.length === 0) {
      console.log('No more unvalidated recipes found. Validation complete!');
      break;
    }

    lastId = recipes[recipes.length - 1].id;
    console.log(`[Batch] Fetched ${recipes.length} candidates (Last ID: ${lastId}). Validating...`);

    const chunkResults = await processChunkWithConcurrency(recipes, CONCURRENCY_LIMIT);
    const validIds = chunkResults.filter((r) => r.isValid).map((r) => r.id);

    totalChecked += recipes.length;

    if (validIds.length > 0) {
      totalValidated += validIds.length;
      const DB_CHUNK = 100;
      for (let i = 0; i < validIds.length; i += DB_CHUNK) {
        const idSub = validIds.slice(i, i + DB_CHUNK);
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ has_valid_image: true })
          .in('id', idSub);

        if (updateError) {
          console.error('[Update Error]:', updateError.message);
        }
      }
      console.log(`[Progress] Validated +${validIds.length} valid images (Total valid: ${totalValidated} / ${totalChecked} checked)`);
    } else {
      console.log(`[Progress] 0 valid in this batch. (Total checked: ${totalChecked})`);
    }
  }

  console.log(`\nValidation complete. Validated: ${totalValidated} / Checked: ${totalChecked}`);
}

if (require.main === module) {
  runValidation().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runValidation, checkImageHead };
