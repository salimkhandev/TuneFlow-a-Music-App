import { clsx } from "clsx";
import { openDB } from "idb";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CACHE_TTL = 10 * 60 * 1000; // Cache expiry time (10 minutes)

// Ensure IndexedDB is only accessed in the browser
const dbPromise =
  typeof window !== "undefined"
    ? openDB("music-app-db", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("api-cache")) {
            db.createObjectStore("api-cache");
          }
        },
      })
    : null;

// Store API responses in IndexedDB with expiry
export async function cacheResponse(key, data) {
  if (!dbPromise) return; // Prevent execution on the server
  const db = await dbPromise;
  const tx = db.transaction("api-cache", "readwrite");
  await tx.store.put({ data, expiry: Date.now() + CACHE_TTL }, key);
  await tx.done;
}

// Retrieve cached response from IndexedDB with expiry check
export async function getCachedResponse(key) {
  if (!dbPromise) return null; // Prevent execution on the server
  const db = await dbPromise;
  const cached = await db.get("api-cache", key);
  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    await db.transaction("api-cache", "readwrite").store.delete(key); // Delete expired data
    return null;
  }
  return cached.data;
}

export function decodeHtmlEntities(text) {
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/html").body.textContent;
}

export function getInitials(text) {
  if (!text) return "";
  return text
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function formatNumber(num) {
  if (typeof num !== "number" || isNaN(num)) return "0";
  if (num < 1000) return num.toString();

  const units = ["K", "M", "B", "T"];
  let unitIndex = -1;
  let formattedNum = num;

  while (formattedNum >= 1000 && unitIndex < units.length - 1) {
    formattedNum /= 1000;
    unitIndex++;
  }

  return `${formattedNum.toFixed(1).replace(/\.0$/, "")}${
    units[unitIndex] || ""
  }`;
}

// Fetch API with caching (first check IndexedDB, then fetch)
async function fetchWithCache(url, cacheKey) {
  const cachedData = await getCachedResponse(cacheKey);
  if (cachedData) {
    console.log("Serving from IndexedDB:", cacheKey);
    return cachedData;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    await cacheResponse(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Network error, no cached data available for:", cacheKey);
    return cachedData || { error: "Failed to fetch data" };
  }
}

// Fetch Playlists
export async function fetchPlaylists({ query = "a", limit = 10 }) {
  const url = `https://saavn.dev/api/search/playlists?query=${query}&limit=${limit}`;
  return await fetchWithCache(url, `playlists_${query}_${limit}`);
}

// Fetch Playlist by ID
export async function fetchPlaylistById({ id, limit = 10 }) {
  const cacheKey = `playlist_${id}`;
  const cachedData = await getCachedResponse(cacheKey);

  if (cachedData) {
    console.log(`Serving cached playlist for: ${id}`);
    return cachedData;
  }

  try {
    const response = await fetch(
      `https://saavn.dev/api/playlists?id=${id}&limit=${limit}`
    );
    const data = await response.json();

    if (data?.data) {
      await cacheResponse(cacheKey, data.data);
      return data.data;
    }
    return data?.message;
  } catch (error) {
    console.error(`Error fetching playlist ${id}:`, error);
    return { error: "Failed to fetch playlist" };
  }
}

// Fetch Artists
export async function fetchArtists({ query = "a", limit = 10 }) {
  const url = `https://saavn.dev/api/search/artists?query=${query}&limit=${limit}`;
  return await fetchWithCache(url, `artists_${query}_${limit}`);
}

// Fetch Artist by ID
export async function fetchArtistById({ id }) {
  const cacheKey = `artist_${id}`;
  const cachedData = await getCachedResponse(cacheKey);

  if (cachedData) {
    console.log(`Serving cached artist for: ${id}`);
    return cachedData;
  }

  try {
    const response = await fetch(
      `https://saavn.dev/api/artists/${id}?sortBy=popularity`
    );
    const data = await response.json();
    if (data?.data) {
      await cacheResponse(cacheKey, data.data);
      return data.data;
    }
    return data?.message;
  } catch (error) {
    return { error: "Failed to fetch artist" };
  }
}

// Fetch Songs
export async function fetchSongs({ query = "a", limit = 10 }) {
  const url = `https://saavn.dev/api/search/songs?query=${query}&limit=${limit}`;
  return await fetchWithCache(url, `songs_${query}_${limit}`);
}

// Fetch Albums
export async function fetchAlbums({ query = "a", limit = 10 }) {
  const url = `https://saavn.dev/api/search/albums?query=${query}&limit=${limit}`;
  return await fetchWithCache(url, `albums_${query}_${limit}`);
}

// Fetch Album by ID
export async function fetchAlbumById({ id }) {
  const cacheKey = `album_${id}`;
  const cachedData = await getCachedResponse(cacheKey);

  if (cachedData) {
    console.log(`Serving cached album for: ${id}`);
    return cachedData;
  }

  try {
    const response = await fetch(`https://saavn.dev/api/albums?id=${id}`);
    const data = await response.json();
    if (data?.data) {
      await cacheResponse(cacheKey, data.data);
      return data.data;
    }
    return data?.message;
  } catch (error) {
    return { error: "Failed to fetch album" };
  }
}

// Search history management utilities
const SEARCH_HISTORY_KEY = 'tuneFlow_search_history';
const MAX_HISTORY_ITEMS = 10;

// Get search history from localStorage
export function getSearchHistory() {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading search history:', error);
    return [];
  }
}

// Add a new search to history
export function addToSearchHistory(query) {
  if (typeof window === 'undefined' || !query?.trim()) return;
  
  try {
    const history = getSearchHistory();
    const trimmedQuery = query.trim().toLowerCase();
    
    // Remove if already exists (to move to top)
    const filteredHistory = history.filter(item => item.toLowerCase() !== trimmedQuery);
    
    // Add to beginning of array
    const newHistory = [query.trim(), ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    console.log('🔍 Search added to history:', query);
  } catch (error) {
    console.error('Error saving search history:', error);
  }
}

// Clear search history
export function clearSearchHistory() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    console.log('🗑️ Search history cleared');
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
}

// Remove a specific search from history
export function removeFromSearchHistory(query) {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getSearchHistory();
    const filteredHistory = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory));
    console.log('❌ Search removed from history:', query);
  } catch (error) {
    console.error('Error removing search from history:', error);
  }
}

