"use client";

import { useOfflineSearch } from '@/lib/hooks/useOfflineSearch';
import { useEffect, useRef, useState } from 'react';

const FallbackIcon = "/icons/favicon-32x32.png";

const OfflineAutosuggest = ({ onSelect, placeholder = "Search offline songs...", className = "" }) => {
  const { search, ready } = useOfflineSearch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const listRef = useRef(null);

  useEffect(() => {
    search(query, ({ results, loading }) => {
      setResults(results);
      setLoading(loading);
      setActive(results?.length ? 0 : -1);
    });
  }, [query, search]);

  const handleKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && active >= 0) { onSelect?.(results[active]); }
  };

  return (
    <div className={`w-full max-w-md ${className}`}>
      <input
        className="w-full px-3 py-2 rounded border bg-background"
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        aria-expanded={results.length > 0}
        aria-controls="offline-suggest-list"
      />
      {query && (
        <div className="mt-2 rounded border bg-popover">
          {loading && <div className="p-2 text-sm text-muted-foreground">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="p-2 text-sm text-muted-foreground">No offline matches</div>
          )}
          {!loading && results.length > 0 && (
            <ul id="offline-suggest-list" ref={listRef} role="listbox" className="max-h-64 overflow-auto">
              {results.map((r, i) => (
                <li
                  key={r.id}
                  role="option"
                  aria-selected={i === active}
                  className={`flex items-center gap-2 px-2 py-2 cursor-pointer ${i === active ? 'bg-muted' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => onSelect?.(r)}
                >
                  <img
                    alt=""
                    className="w-8 h-8 rounded object-cover"
                    src={r.image?.[r.image.length - 1]?.url || FallbackIcon}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm">{r.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.artist}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflineAutosuggest;


