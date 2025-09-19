"use client";
import { ArtistCard } from "@/components/artist-card/ArtistCard";
import Loader from "@/components/loader/Loader";
import { PlaylistCard } from "@/components/playlist-card/PlaylistCard";
import { SongList } from "@/components/song-list/SongList";
import { Button } from "@/components/ui/button";
import { fetchArtists } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [artists, setArtists] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("a"); // Start with 'a'
  const [limit, setLimit] = useState(50);

  const handleFetchArtists = async (query) => {
    setIsLoadingArtists(true);
    const newArtists = await fetchArtists({ query, limit });
    const results = newArtists?.data?.results;
    setArtists((prevArtists) => [...prevArtists, ...results]); // Append new artists
    setIsLoadingArtists(false);
  };

  useEffect(() => {
    handleFetchArtists(currentQuery);
  }, []);

  const loadMorePlaylists = () => {
    if (currentQuery >= "z") return; // Stop at 'z'

    const nextQuery = String.fromCharCode(currentQuery.charCodeAt(0) + 1); // Increment alphabet
    setCurrentQuery(nextQuery);
    handleFetchArtists(nextQuery);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Artists</h1>
      {isLoadingArtists && artists.length === 0 ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {artists.map((artist, i) => (
              <ArtistCard key={i} artist={artist} />
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
