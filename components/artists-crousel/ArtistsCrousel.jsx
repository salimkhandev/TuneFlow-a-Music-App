import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArtistCard } from "../artist-card/ArtistCard";

export default function ArtistsCrousel({ artists }) {
  return (
    <div className="flex items-center justify-center w-full px-8">
      <Carousel className="w-full">
        <CarouselContent className="-ml-1">
          {artists?.map((artist, index) => (
            <CarouselItem
              key={index}
              className="pl-1 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-4"
            >
              <ArtistCard artist={artist} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
