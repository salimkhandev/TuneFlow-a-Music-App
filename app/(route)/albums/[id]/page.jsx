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

  const getLastImageUrl = (images) => {
    if (!Array.isArray(images) || images.length === 0) return null;
    const last = images[images.length - 1];
    return last?.url || null;
  };

  return (
    <div className="relative min-h-screen">
      {isLoadingAlbum || !album ? (
        <Loader />
      ) : (
        <div>
          {/* Blurred background image */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <img
              src={getLastImageUrl(album?.image) || 
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMyMCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgMjQwQzIwNS40NjQgMjQwIDI0MCAyMDUuNDY0IDI0MCAxNjBDMjQwIDExNC41MzYgMjA1LjQ2NCA4MCAxNjAgODBDMTE0LjUzNiA4MCA4MCAxMTQuNTM2IDgwIDE2MEM4MCAyMDUuNDY0IDExNC41MzYgMjQwIDE2MCAyNDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMzYgMTI4TDEzNiAxOTJMMTYwIDE3NkwxODQgMTkyTDE4NCAxMjhMMTM2IDEyOFoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+"}
              alt="album image"
              className="w-full h-full object-cover object-center blur-lg scale-105"
            />
            <div className="absolute inset-0 bg-background/70"></div>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <div className="sticky top-0 bg-background/70 backdrop-blur-sm py-4 px-6 z-10">
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
