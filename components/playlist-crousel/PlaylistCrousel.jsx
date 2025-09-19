import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PlaylistCard } from "../playlist-card/PlaylistCard";

export default function PlaylistCrousel({ playlists = [] }) {
  return (
    <div className="flex items-center justify-center w-full px-8">
      <Carousel className="w-full">
        <CarouselContent className="-ml-1">
          {playlists?.map((playlist) => (
            <CarouselItem
              key={playlist.id}
              className="pl-1 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 p-1"
            >
              <PlaylistCard playlist={playlist} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
