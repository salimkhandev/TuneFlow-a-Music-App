"use client";
import Loader from "@/components/loader/Loader";
import { SongList } from "@/components/song-list/SongList";
import { Button } from "@/components/ui/button";
import { fetchSongs } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const Page = () => {
  const { data: session } = useSession();
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [songs, setSongs] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("a"); // Start with 'a'
  const [limit, setLimit] = useState(50);
  const [likedSongs, setLikedSongs] = useState([]);
  const [isClient, setIsClient] = useState(false);

  const handleFetchSongs = async (query) => {
    setIsLoadingSongs(true);
    const newSongs = await fetchSongs({ query, limit });
    const results = newSongs?.data?.results;
    
    // Filter out duplicate songs based on ID
    setSongs((prevSongs) => {
      const existingIds = new Set(prevSongs.map(song => song.id));
      const uniqueNewSongs = results.filter(song => !existingIds.has(song.id));
      return [...prevSongs, ...uniqueNewSongs];
    });
    
    setIsLoadingSongs(false);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    handleFetchSongs(currentQuery);
  }, []);

  // Load liked songs from DB
  useEffect(() => {
    if (!isClient || !session?.user) return;
    fetch('/api/liked-songs')
      .then(r => r.json())
      .then(d => setLikedSongs(Array.isArray(d.items) ? d.items : []))
      .catch(() => setLikedSongs([]));
  }, [isClient, session?.user?.email]);

  const loadMoreSongs = () => {
    if (currentQuery >= "z") return; // Stop at 'z'

    const nextQuery = String.fromCharCode(currentQuery.charCodeAt(0) + 1); // Increment alphabet
    setCurrentQuery(nextQuery);
    handleFetchSongs(nextQuery);
  };

  const handleToggleLike = async (song) => {
    if (!session?.user) return;
    
    const isLiked = likedSongs.some(likedSong => likedSong.id === song.id);
    
    try {
      if (isLiked) {
        // Remove from liked
        await fetch('/api/liked-songs', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId: song.id })
        });
        setLikedSongs(prev => prev.filter(likedSong => likedSong.id !== song.id));
      } else {
        // Add to liked
        const songWithTimestamp = { ...song, likedAt: new Date().toISOString() };
        await fetch('/api/liked-songs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ song: songWithTimestamp })
        });
        setLikedSongs(prev => [...prev, songWithTimestamp]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDownload = (song) => {
    if (!song.downloadUrl) return;
    
    const downloadUrl = song.downloadUrl.find(u => u.quality === "320kbps")?.url || 
                       song.downloadUrl[song.downloadUrl.length - 1]?.url;
    
    if (downloadUrl) {
      const params = new URLSearchParams({ url: downloadUrl, name: song.name || "song" });
      const a = document.createElement("a");
      a.href = `/api/download?${params.toString()}`;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Songs</h1>
      {isLoadingSongs && songs.length === 0 ? (
        <Loader />
      ) : (
        <>
          <SongList 
            songs={songs} 
            grid={true} 
            likedSongs={likedSongs}
            onToggleLike={handleToggleLike}
            onDownload={handleDownload}
          />
          <div className="flex justify-center">
            <Button onClick={loadMoreSongs} disabled={currentQuery >= "z"}>
              Load More Songs
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
