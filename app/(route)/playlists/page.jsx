"use client";
import Loader from "@/components/loader/Loader";
import { PlaylistCard } from "@/components/playlist-card/PlaylistCard";
import { SongList } from "@/components/song-list/SongList";
import { Button } from "@/components/ui/button";
import { fetchPlaylists } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("a"); // Start with 'a'
  const [limit, setLimit] = useState(50);

  const handleFetchPlaylists = async (query) => {
    setIsLoadingPlaylists(true);
    const newPlaylists = await fetchPlaylists({ query, limit });
    const results = newPlaylists?.data?.results;
    setPlaylists((prevPlaylists) => [...prevPlaylists, ...results]); // Append new playlists
    setIsLoadingPlaylists(false);
  };

  useEffect(() => {
    handleFetchPlaylists(currentQuery);
  }, []);

  const loadMorePlaylists = () => {
    if (currentQuery >= "z") return; // Stop at 'z'

    const nextQuery = String.fromCharCode(currentQuery.charCodeAt(0) + 1); // Increment alphabet
    setCurrentQuery(nextQuery);
    handleFetchPlaylists(nextQuery);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Playlists</h1>
      {isLoadingPlaylists && playlists.length === 0 ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {playlists.map((playlist, i) => (
              <PlaylistCard key={i} playlist={playlist} />
            ))}
          </div>
          <div className="flex justify-center">
            <Button onClick={loadMorePlaylists} disabled={currentQuery >= "z"}>
              Load More Songs
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
