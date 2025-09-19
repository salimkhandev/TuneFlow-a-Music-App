"use client";
import Loader from "@/components/loader/Loader";
import { SongList } from "@/components/song-list/SongList";
import { Button } from "@/components/ui/button";
import {
  playSong,
  setProgress,
  togglePlayPause,
} from "@/lib/slices/playerSlice";
import { decodeHtmlEntities, fetchPlaylistById } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const page = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const searchParams = useSearchParams();
  const songsCount = searchParams.get("songsCount");
  // const dispatch = useDispatch();

  // const { currentSong, isPlaying } = useSelector((state) => state.player);

  const handleFetchPlaylist = async () => {
    setIsLoadingPlaylist(true);
    const newPlaylist = await fetchPlaylistById({ id, limit: songsCount });

    setPlaylist(newPlaylist); // Append new playlists
    setIsLoadingPlaylist(false);
  };

  // const handlePlayPausePlaylist = () => {
  //   dispatch(setProgress(0));
  //   dispatch(playSong(playlist?.songs[0]));
  //   dispatch(playSong({ queue: songsQueue, index }));
  //   dispatch(togglePlayPause());
  //   if (isPlaying) {
  //     dispatch(togglePlayPause());
  //   }
  // };

  useEffect(() => {
    handleFetchPlaylist();
  }, [id]);

  return (
    <div>
      {isLoadingPlaylist || !playlist ? (
        <Loader />
      ) : (
        <div>
          <div className="relative">
            <img
              src={playlist?.image[playlist?.image?.length - 1].url}
              alt="playlist image"
              className="w-full h-44 object-cover object-top"
            />
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent z-50"></div>
            {/* <Button
              size="icon"
              className="absolute -bottom-4 right-10 rounded-full z-50 w-14 h-14"
              onClick={handlePlayPausePlaylist}
            >
              {isPlaying ? <Pause /> : <Play />}
            </Button> */}
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="sticky top-0 bg-background py-4 z-10">
              <h1 className="text-lg font-semibold">
                {decodeHtmlEntities(playlist?.name)}
              </h1>
              <p className="text-muted-foreground">
                {decodeHtmlEntities(playlist?.description)}
              </p>
            </div>

            <SongList songs={playlist?.songs} grid={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
