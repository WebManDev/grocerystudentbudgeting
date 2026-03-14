import "server-only";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CACHE_FILE = join(process.cwd(), ".coles-build-id-cache.json");
const COLES_CACHE_TTL = 30 * 60 * 1000; // 30 min

// In-memory cache (fast path)
let memCache = { buildId: null, cachedAt: null };

function loadDiskCache() {
  try {
    const raw = readFileSync(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.buildId && parsed.cachedAt) {
      memCache = parsed;
    }
  } catch {
    // No cache file yet — that's fine
  }
}

function saveDiskCache(buildId) {
  const entry = { buildId, cachedAt: Date.now() };
  memCache = entry;
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(entry), "utf8");
  } catch (e) {
    console.warn("Could not write Coles buildId cache:", e.message);
  }
}

// Load disk cache on module init
loadDiskCache();

async function getColesBuildId() {
  const now = Date.now();
  // Return memory cache if still fresh
  if (memCache.buildId && memCache.cachedAt && now - memCache.cachedAt < COLES_CACHE_TTL) {
    return memCache.buildId;
  }

  // Try to fetch a fresh buildId
  try {
    const res = await fetch("https://www.coles.com.au", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-AU,en;q=0.9",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const match =
        html.match(/"buildId"\s*:\s*"([^"]+)"/) ||
        html.match(/<script id="__NEXT_DATA__"[^>]*>[\s\S]*?"buildId"\s*:\s*"([^"]+)"/);
      if (match?.[1]) {
        saveDiskCache(match[1]);
        return match[1];
      }
    }
  } catch (e) {
    console.warn("Coles homepage fetch failed:", e.message);
  }

  // Fall back to stale cache (even if expired) rather than returning null
  if (memCache.buildId) {
    console.warn("Using stale Coles buildId as fallback");
    return memCache.buildId;
  }

  return null;
}