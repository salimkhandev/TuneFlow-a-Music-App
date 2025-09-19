"use client";
import Loader from "@/components/loader/Loader";
import { SongList } from "@/components/song-list/SongList";
import { Button } from "@/components/ui/button";
import { fetchSongs } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [songs, setSongs] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("a"); // Start with 'a'
  const [limit, setLimit] = useState(50);

  const handleFetchSongs = async (query) => {
    setIsLoadingSongs(true);
    const newSongs = await fetchSongs({ query, limit });
    const results = newSongs?.data?.results;
    setSongs((prevSongs) => [...prevSongs, ...results]); // Append new songs
    setIsLoadingSongs(false);
  };

  useEffect(() => {
    handleFetchSongs(currentQuery);
  }, []);

  const loadMoreSongs = () => {
    if (currentQuery >= "z") return; // Stop at 'z'

    const nextQuery = String.fromCharCode(currentQuery.charCodeAt(0) + 1); // Increment alphabet
    setCurrentQuery(nextQuery);
    handleFetchSongs(nextQuery);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Songs</h1>
      {isLoadingSongs && songs.length === 0 ? (
        <Loader />
      ) : (
        <>
          <SongList songs={songs} grid={true} />
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
