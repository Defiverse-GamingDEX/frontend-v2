const fs = require('fs');
const path = require('path');
const https = require('https');

const LOCKFILE_PATH = path.join(process.cwd(), 'pnpm-lock.yaml');
const CACHE_DIR = path.join(process.cwd(), 'node_modules', '.cache');
const CACHE_PATH = path.join(CACHE_DIR, 'quarantine-cache.json');

// 7 days in milliseconds
const QUARANTINE_MS = 7 * 24 * 60 * 60 * 1000;

// Packages that are explicitly allowed to bypass the 7-day quarantine
const ALLOWLIST = [
  '@coinbase/cdp-sdk@1.49.0',
  '@nuxt/kit@3.21.5',
  '@types/estree@1.0.9',
];

function fetchPackageInfo(pkgName) {
  return new Promise((resolve, reject) => {
    https
      .get(`https://registry.npmjs.org/${encodeURIComponent(pkgName)}`, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(
                new Error(`Failed to parse registry response for ${pkgName}`)
              );
            }
          } else if (res.statusCode === 404) {
            resolve(null); // Private or local package
          } else {
            reject(
              new Error(`Registry error ${res.statusCode} for ${pkgName}`)
            );
          }
        });
      })
      .on('error', reject);
  });
}

async function run() {
  if (!fs.existsSync(LOCKFILE_PATH)) {
    console.log('No pnpm-lock.yaml found. Skipping quarantine check.');
    return;
  }

  const lockfileContent = fs.readFileSync(LOCKFILE_PATH, 'utf-8');

  // Extract packages from pnpm-lock.yaml.
  // Example lines:
  //   /@aave/protocol-js@4.3.0:
  //   '@aave/protocol-js@4.3.0':
  //   clipboardy@3.0.0:
  const packageRegex = /^\s{2}'?(?:\/)?(@?[^@'\n]+)@([^:'\n]+)'?:/gm;
  let match;
  const packages = new Map();

  while ((match = packageRegex.exec(lockfileContent)) !== null) {
    const pkgName = match[1];
    const pkgVersion = match[2].split('(')[0]; // Remove peer dependency suffixes like (vue@3.2.45)
    packages.set(`${pkgName}@${pkgVersion}`, {
      name: pkgName,
      version: pkgVersion,
    });
  }

  console.log(`🔍 Found ${packages.size} unique packages in pnpm-lock.yaml.`);

  // Load cache
  let cache = {};
  if (fs.existsSync(CACHE_PATH)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    } catch (e) {
      cache = {};
    }
  }

  const packagesToCheck = Array.from(packages.values()).filter(p => {
    const pkgId = `${p.name}@${p.version}`;
    if (ALLOWLIST.includes(pkgId)) {
      cache[pkgId] = true;
      return false;
    }
    return !cache[pkgId];
  });
  console.log(
    `📦 Packages to check against NPM registry: ${packagesToCheck.length}`
  );

  if (packagesToCheck.length === 0) {
    console.log('✅ All packages have already passed quarantine.');
    return;
  }

  let hasFailed = false;
  let processed = 0;

  // Concurrency limit to avoid overwhelming the registry
  const CONCURRENCY = 50;
  for (let i = 0; i < packagesToCheck.length; i += CONCURRENCY) {
    const batch = packagesToCheck.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async pkg => {
        try {
          const info = await fetchPackageInfo(pkg.name);
          if (!info || !info.time || !info.time[pkg.version]) {
            // Could be a private package or missing metadata. We skip.
            cache[`${pkg.name}@${pkg.version}`] = true;
            return;
          }

          const publishTime = new Date(info.time[pkg.version]).getTime();
          const ageMs = Date.now() - publishTime;

          if (ageMs < QUARANTINE_MS) {
            console.error(
              `\n🚨 SECURITY ALERT: Package ${pkg.name}@${pkg.version} is younger than 7 days!`
            );
            console.error(
              `   Published at: ${new Date(
                publishTime
              ).toISOString()} (${Math.round(
                ageMs / 1000 / 60 / 60
              )} hours ago)`
            );
            hasFailed = true;
          } else {
            cache[`${pkg.name}@${pkg.version}`] = true;
          }
        } catch (err) {
          console.warn(
            `⚠️ Warning: Could not fetch info for ${pkg.name}: ${err.message}`
          );
        }
      })
    );

    processed += batch.length;
    process.stdout.write(
      `\r⏳ Checking... ${processed}/${packagesToCheck.length}`
    );
  }

  console.log('\n');

  // Save cache
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

  if (hasFailed) {
    console.error(
      '❌ Installation aborted due to 7-day quarantine policy violations.'
    );
    process.exit(1);
  } else {
    console.log('✅ All packages have passed the 7-day quarantine check.');
  }
}

run().catch(console.error);
