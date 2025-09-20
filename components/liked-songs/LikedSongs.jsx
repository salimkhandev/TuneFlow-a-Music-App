"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clearQueue, playSong, setProgress, togglePlayPause } from "@/lib/slices/playerSlice";
import { decodeHtmlEntities } from "@/lib/utils";
import { AudioLines, Clock, Heart, MoreHorizontal, Pause, Play } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SongMenu from "../song-menu/SongMenu";

const LikedSongs = () => {
  const dispatch = useDispatch();
  const { currentSong, isPlaying, queue } = useSelector((state) => state.player);
  const [likedSongs, setLikedSongs] = useState([]);
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load liked songs from DB
  useEffect(() => {
    if (!isClient || !session?.user) return;
    fetch('/api/liked-songs')
      .then(r => r.json())
      .then(d => setLikedSongs(Array.isArray(d.items) ? d.items : []))
      .catch(() => setLikedSongs([]));
  }, [isClient, session]);

  // Reload when session changes
  useEffect(() => {
    if (!isClient || !session?.user) return;
    fetch('/api/liked-songs')
      .then(r => r.json())
      .then(d => setLikedSongs(Array.isArray(d.items) ? d.items : []))
      .catch(() => setLikedSongs([]));
  }, [isClient, session?.user?.email]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = (song, index) => {
    if (currentSong?.id === song.id) {
      dispatch(togglePlayPause());
    } else {
      // Check if our songs array is the same as the current queue
      const isSameQueue =
        queue.length === likedSongs.length &&
        likedSongs.every((s, i) => s.id === queue[i]?.id);

      if (!isSameQueue) {
        // If we're playing from a different list, rebuild the queue
        dispatch(clearQueue());
        dispatch(playSong({ queue: likedSongs, index }));
      } else {
        // If we're in the same queue, just jump to the song
        const songIndex = queue.findIndex((s) => s.id === song.id);
        if (songIndex !== -1) {
          dispatch(playSong({ queue, index: songIndex }));
        }
      }
      dispatch(setProgress(0));
      
      // Trigger user interaction for full-screen player
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userInteraction'));
      }
    }
  };

  const handleRemoveFromLiked = (songId) => {
    if (!isClient || !session?.user) return;
    fetch(`/api/liked-songs?songId=${encodeURIComponent(songId)}`, { method: 'DELETE' })
      .then(() => setLikedSongs(prev => prev.filter(s => s.id !== songId)))
      .catch(() => {});
  };

  const handleToggleLike = (song) => {
    handleRemoveFromLiked(song.id);
  };

  const handleDownload = (song) => {
    if (!song.downloadUrl) return;
    
    const downloadUrl = song.downloadUrl.find(u => u.quality === "320kbps")?.url || 
                       song.downloadUrl[song.downloadUrl.length - 1]?.url;
    
    if (downloadUrl) {
      const params = new URLSearchParams({ url: downloadUrl, name: song.name || "song" });
      const a = document.createElement("a");
      a.href = `/api/download?${params.toString()}`;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };


  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-2xl">
            <Heart className="w-12 h-12 sm:w-20 sm:h-20 text-white" />
          </div>
          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Playlist</p>
              <h1 className="text-2xl sm:text-4xl font-bold">Liked Songs</h1>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
        <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-2xl">
          <Heart className="w-12 h-12 sm:w-20 sm:h-20 text-white" />
        </div>
        
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Playlist</p>
            <h1 className="text-2xl sm:text-4xl font-bold">Liked Songs</h1>
          </div>
          
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            <span>{likedSongs.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center sm:justify-start gap-4">
        <Button 
          size="lg" 
          className="rounded-full bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          onClick={() => likedSongs.length > 0 && handlePlayPause(likedSongs[0], 0)}
        >
          <Play className="w-6 h-6 mr-2" />
          Play
        </Button>
        
        <Button variant="outline" size="icon" className="rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Songs List */}
      <div className="space-y-2">
        {/* Header Row - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-10 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Title</div>
          <div className="col-span-2">Album</div>
          <div className="col-span-1 flex justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Songs */}
        {likedSongs.map((song, index) => (
          <Card 
            key={song.id} 
            className={`group hover:bg-muted/50 transition-colors cursor-pointer ${
              currentSong?.id === song.id && "bg-muted/50"
            }`}
            onClick={() => handlePlayPause(song, index)}
          >
            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-10 gap-4 items-center p-4">
              <div className="col-span-1 text-sm text-muted-foreground group-hover:hidden">
                {index + 1}
              </div>
              <div className="col-span-1 hidden group-hover:block">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause(song, index);
                  }}
                >
                  {currentSong?.id === song.id && isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                  <img
                    src={song.image?.[song.image.length - 1]?.url || '/placeholder-album.jpg'}
                    alt={song.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{song.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artists?.primary
                      ?.map((artist) => decodeHtmlEntities(artist.name))
                      .join(", ") || "Unknown Artist"}
                  </p>
                </div>
              </div>
              
              <div className="col-span-2 text-sm text-muted-foreground truncate">
                {song.album?.name || "Unknown Album"}
              </div>
              
              <div className="col-span-1 flex items-center justify-center gap-2">
                {currentSong?.id === song?.id ? (
                  <AudioLines className="text-foreground" />
                ) : (
                  <span className="text-sm text-muted-foreground">{formatDuration(song.duration)}</span>
                )}
                <SongMenu
                  song={song}
                  isLiked={true}
                  onToggleLike={handleToggleLike}
                  onDownload={handleDownload}
                />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden p-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 bg-muted rounded-md flex items-center justify-center group">
                  <img
                    src={song.image?.[song.image.length - 1]?.url || '/placeholder-album.jpg'}
                    alt={song.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                  {/* Play/Pause button overlay */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute inset-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPause(song, index);
                    }}
                  >
                    {currentSong?.id === song.id && isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" />
                    )}
                  </Button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{song.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artists?.primary
                      ?.map((artist) => decodeHtmlEntities(artist.name))
                      .join(", ") || "Unknown Artist"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {song.album?.name || "Unknown Album"}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-muted-foreground">
                    {currentSong?.id === song?.id ? (
                      <AudioLines className="text-foreground" />
                    ) : (
                      formatDuration(song.duration)
                    )}
                  </div>
                  <SongMenu
                    song={song}
                    isLiked={true}
                    onToggleLike={handleToggleLike}
                    onDownload={handleDownload}
                    className="opacity-100"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State (if no liked songs) */}
      {likedSongs.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No liked songs yet</h3>
          <p className="text-muted-foreground">
            Songs you like will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default LikedSongs;
