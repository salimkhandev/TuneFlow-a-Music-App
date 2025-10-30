"use client";
import { Card, CardContent } from "@/components/ui/card";
import { fetchArtistById } from "@/lib/utils";
import { useEffect, useState } from "react";
import Link from "next/link";

export function ArtistCard({ artist }) {

  const [hasMusic, setHasMusic] = useState(false);

  useEffect(() => {
    fetchArtistById({ id: artist.id }).then((data) => {
      const hasTopSongs = data?.topSongs && data.topSongs.length > 0;
      const hasTopAlbums = data?.topAlbums && data.topAlbums.length > 0;

      setHasMusic(hasTopSongs || hasTopAlbums);
    });
  }, [artist.id]);



  return (
   ( hasMusic && <Link href={`/artists/${artist.id}`} prefetch={true}>
      <Card className="overflow-hidden flex flex-col items-center justify-center w-full hover:opacity-75 transition text-center border-none shadow-none">
        <CardContent className="p-0">
          <div className="aspect-square relative w-full">
            <img
              src={artist.image[artist.image.length - 1].url}
              alt={artist.name}
              className="object-cover w-full h-full rounded-full"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold truncate">{artist.name}</h3>
          </div>
        </CardContent>
      </Card>
    </Link>)
  );
}
