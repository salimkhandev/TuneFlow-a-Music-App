"use client";
import AlbumsList from "@/components/albums-list/AlbumsList";
import Loader from "@/components/loader/Loader";
import { PlaylistCard } from "@/components/playlist-card/PlaylistCard";
import { Button } from "@/components/ui/button";
import { fetchAlbums } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("a"); // Start with 'a'
  const [limit, setLimit] = useState(50);

  const handleFetchAlbums = async (query) => {
    setIsLoadingAlbums(true);
    const newAlbums = await fetchAlbums({ query, limit });
    const results = newAlbums?.data?.results;
    setAlbums((prevAlbums) => [...prevAlbums, ...results]); // Append new playlists
    setIsLoadingAlbums(false);
  };

  useEffect(() => {
    handleFetchAlbums(currentQuery);
  }, []);

  const loadMorePlaylists = () => {
    if (currentQuery >= "z") return; // Stop at 'z'

    const nextQuery = String.fromCharCode(currentQuery.charCodeAt(0) + 1); // Increment alphabet
    setCurrentQuery(nextQuery);
    handleFetchAlbums(nextQuery);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Albums</h1>
      {isLoadingAlbums && albums.length === 0 ? (
        <Loader />
      ) : (
        <>
          <AlbumsList albums={albums} />
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
