"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { fetchArtistById, formatNumber, getInitials } from "@/lib/utils";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { SongList } from "@/components/song-list/SongList";
import AlbumsList from "@/components/albums-list/AlbumsList";

const page = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [isLoadingArtist, setIsLoadingArtist] = useState();

  const handleFetchPlaylist = async () => {
    setIsLoadingArtist(true);
    const newPlaylist = await fetchArtistById({ id });

    setArtist(newPlaylist); // Append new playlists
    setIsLoadingArtist(false);
  };

  useEffect(() => {
    handleFetchPlaylist();
  }, [id]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <Card className="flex items-center gap-4 p-4">
        <Avatar className="h-20 w-20 sm:h-32 sm:w-32">
          <AvatarImage
            src={artist?.image[artist?.image?.length - 1]?.url}
            alt="@shadcn"
          />
          <AvatarFallback>{getInitials(artist?.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-semibold">{artist?.name || "Artist"}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {formatNumber(artist?.followerCount)} Followers
          </p>
          <Badge className={"w-fit mt-1"}>
            {artist?.isVerified ? (
              <span className="flex items-center gap-1">
                <ShieldCheck size={15} />
                Verified
              </span>
            ) : (
              "Not Verified"
            )}
          </Badge>
        </div>
      </Card>
      <h1 className="text-2xl font-semibold">Bio</h1>
      <Card className="p-4">
        <p>{artist?.bio?.length === 0 && "No Bio Available"}</p>
        <Accordion type="single" collapsible className="w-full">
          {artist?.bio?.map((bio, i) => (
            <AccordionItem key={i} value={bio?.sequence}>
              <AccordionTrigger className="hover:no-underline py-2">
                {bio?.title}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {bio?.text}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
      <h1 className="text-2xl font-semibold">Top Songs</h1>
      <Card className="p-4">
        <SongList songs={artist?.topSongs} grid={true} />
      </Card>
      <h1 className="text-2xl font-semibold">Top Albums</h1>
      <Card className="p-4">
        <AlbumsList albums={artist?.topAlbums} />
      </Card>
    </div>
  );
};

export default page;
