"use client";
import Loader from "@/components/loader/Loader";
import { SongList } from "@/components/song-list/SongList";
import { decodeHtmlEntities, fetchAlbumById } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const page = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState();

  const handleFetchAlbum = async () => {
    setIsLoadingAlbum(true);
    const newAlbum = await fetchAlbumById({ id });

    setAlbum(newAlbum); // Append new albums
    setIsLoadingAlbum(false);
  };

  useEffect(() => {
    handleFetchAlbum();
  }, [id]);

  return (
    <div className="relative min-h-screen">
      {isLoadingAlbum || !album ? (
        <Loader />
      ) : (
        <div>
          {/* Blurred background image */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <img
              src={album?.image[album?.image?.length - 1].url}
              alt="album image"
              className="w-full h-full object-cover object-center blur-lg scale-105"
            />
            <div className="absolute inset-0 bg-background/70"></div>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <div className="sticky top-0 bg-background/70 backdrop-blur-sm py-4 z-10">
              <h1 className="text-lg font-semibold">
                {decodeHtmlEntities(album?.name)}
              </h1>
              <p className="text-muted-foreground">
                {decodeHtmlEntities(album?.description)}
              </p>
            </div>

            <SongList songs={album?.songs} grid={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
