import { useOfflineAudio } from '@/lib/hooks/useOffline';
import { initOfflineAudioDB } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';

const normalize = (s) => (s || '').toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu, '');

export function useOfflineSearch({ debounceMs = 180, limit = 12 } = {}) {
  const reduxAudio = useOfflineAudio();
  const [index, setIndex] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const cacheRef = useRef(new Map()); // query -> results

  // Build index from Redux, fallback to IDB metadata
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let items = reduxAudio;
        if (!items?.length) {
          const db = await initOfflineAudioDB();
          if (db) {
            const tx = db.transaction(['offlineMetadata'], 'readonly');
            const store = tx.objectStore('offlineMetadata');
            items = await new Promise((resolve, reject) => {
              const req = store.getAll();
              req.onsuccess = () => resolve(req.result || []);
              req.onerror = () => reject(req.error);
            });
          } else {
            items = [];
          }
        }
        const built = (items || []).map((it) => {
          const artist = it?.artists?.primary?.map((a) => a.name).join(', ') || it.artist || '';
          return {
            id: it.songId || it.id,
            displayName: it.name || '',
            artist,
            name_n: normalize(it.name),
            artist_n: normalize(artist),
            image: it.image,
            likedAt: it.likedAt ? Date.parse(it.likedAt) : 0,
            storedAt: it.storedAt ? Date.parse(it.storedAt) : 0,
            raw: it,
          };
        });
        if (!cancelled) setIndex(built);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reduxAudio]);

  const search = useMemo(() => {
    const rank = (q, item) => {
      const qn = normalize(q);
      const nameIdx = item.name_n.indexOf(qn);
      const artistIdx = item.artist_n.indexOf(qn);
      let score = 0;
      if (nameIdx === 0) score += 3; // prefix in name
      else if (nameIdx > 0) score += 2; // substring in name
      if (artistIdx === 0) score += 1.5; // prefix in artist
      else if (artistIdx > 0) score += 1; // substring in artist
      score += (item.likedAt || item.storedAt) / 1e12; // mild recency bump
      return score;
    };

    return (query, cb) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!query?.trim()) {
        cb({ results: [], loading: false });
        return;
      }
      const trimmed = query.trim();
      // cached
      if (cacheRef.current.has(trimmed)) {
        cb({ results: cacheRef.current.get(trimmed), loading: false });
        return;
      }
      timerRef.current = setTimeout(() => {
        const qn = normalize(trimmed);
        const results = index
          .filter((it) => it.name_n.includes(qn) || it.artist_n.includes(qn))
          .map((it) => ({ id: it.id, title: it.displayName, artist: it.artist, image: it.image, raw: it.raw }))
          .sort((a, b) => rank(trimmed, b.raw) - rank(trimmed, a.raw))
          .slice(0, limit);
        cacheRef.current.set(trimmed, results);
        if (cacheRef.current.size > 30) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
        cb({ results, loading: false });
      }, debounceMs);
      cb({ results: [], loading: true });
    };
  }, [index, debounceMs, limit]);

  return { search, loading, ready: index.length > 0 };
}


