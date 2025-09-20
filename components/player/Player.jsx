"use client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  nextSong,
  previousSong,
  setProgress,
  setVolume,
  togglePlayPause,
} from "@/lib/slices/playerSlice";
import {
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FullScreenPlayer from "./FullScreenPlayer";

const Player = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { currentSong, isPlaying, volume, progress, queue, queueIndex } =
    useSelector((state) => state.player);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const isLoadingRef = useRef(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [likedSongs, setLikedSongs] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    setIsHydrated(true);
    setLocalProgress(progress);
  }, [progress]);

  // Track user interaction for autoplay policy
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('userInteraction', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('userInteraction', handleUserInteraction);
    };
  }, []);

  // Show full-screen player when a song is selected and start playing
  useEffect(() => {
    if (currentSong && hasUserInteracted) {
      setShowFullScreen(true);
      // Start playing the song immediately when full-screen opens
      dispatch(togglePlayPause());
    }
  }, [currentSong, hasUserInteracted, dispatch]);

  // Handle play button click
  const handlePlayClick = () => {
    setHasUserInteracted(true);
    dispatch(togglePlayPause());
  };

  // Load liked songs from DB
  useEffect(() => {
    if (!isClient || !session?.user) return;
    fetch('/api/liked-songs')
      .then(r => r.json())
      .then(d => setLikedSongs(Array.isArray(d.items) ? d.items : []))
      .catch(() => setLikedSongs([]));
  }, [isClient, session]);

  // Reload liked songs when user changes
  useEffect(() => {
    if (!isClient || !session?.user) return;
    fetch('/api/liked-songs')
      .then(r => r.json())
      .then(d => setLikedSongs(Array.isArray(d.items) ? d.items : []))
      .catch(() => setLikedSongs([]));
  }, [isClient, session?.user?.email]);
  
  // Build current audio URL and download via API proxy to force attachment
  const getCurrentAudioUrl = () => {
    if (!currentSong?.downloadUrl) return "";
    return (
      currentSong.downloadUrl.find((u) => u.quality === "320kbps")?.url ||
      currentSong.downloadUrl[currentSong.downloadUrl.length - 1]?.url ||
      ""
    );
  };

  const handleDownload = () => {
    const src = getCurrentAudioUrl();
    if (!src) return;
    const params = new URLSearchParams({ url: src, name: currentSong?.name || "song" });
    const a = document.createElement("a");
    a.href = `/api/download?${params.toString()}`;
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Check if current song is liked
  const isSongLiked = useCallback((songId) => {
    return likedSongs.some(likedSong => likedSong.id === songId);
  }, [likedSongs]);

  // Handle like/unlike song
  const handleToggleLike = useCallback(() => {
    if (!isClient || !currentSong) return;
    if (!session?.user) {
      signIn("google", { callbackUrl: "/" });
      return;
    }
    const isAlready = likedSongs.some(s => s.id === currentSong.id);
    if (isAlready) {
      fetch(`/api/liked-songs?songId=${encodeURIComponent(currentSong.id)}`, { method: 'DELETE' })
        .then(() => setLikedSongs(prev => prev.filter(s => s.id !== currentSong.id)))
        .catch(() => {});
    } else {
      const songWithTimestamp = { ...currentSong, likedAt: new Date().toISOString() };
      fetch('/api/liked-songs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ song: songWithTimestamp }) })
        .then(() => setLikedSongs(prev => [...prev, songWithTimestamp]))
        .catch(() => {});
    }
  }, [isClient, currentSong, session, likedSongs]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current || isLoadingRef.current) return;

    if (currentSong && currentSong.downloadUrl) {
      const audioUrl =
        currentSong.downloadUrl.find((url) => url.quality === "320kbps")?.url ||
        currentSong.downloadUrl[currentSong.downloadUrl.length - 1]?.url;

      if (audioUrl && audioRef.current.src !== audioUrl) {
        isLoadingRef.current = true;
        
        // Pause and reset before loading new source
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        
        // Reset loading flag when load is complete
        audioRef.current.onloadeddata = () => {
          isLoadingRef.current = false;
        };
        
        // Don't auto-play - only play when user explicitly clicks play
        // Audio will be ready to play when user clicks the play button
      }
    }
  }, [currentSong, isPlaying]);

  // Handle play/pause - only when user explicitly clicks play button
  useEffect(() => {
    if (!audioRef.current || !isHydrated) return;

    if (isPlaying && hasUserInteracted) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio started playing");
          })
          .catch((err) => {
            // Only log non-abort errors
            if (err.name !== 'AbortError') {
              console.error("Playback failed:", err);
            }
          });
      }
    } else if (!isPlaying) {
      audioRef.current.pause();
    }
  }, [isPlaying, isHydrated, hasUserInteracted]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Function to update progress smoothly
  const updateProgress = () => {
    if (!audioRef.current) return;

    const duration = audioRef.current.duration;
    if (!isNaN(duration)) {
      const calculatedProgress =
        (audioRef.current.currentTime / duration) * 100;
      setLocalProgress(calculatedProgress);

      // Update Redux only when there's a significant change (reducing unnecessary re-renders)
      if (Math.abs(calculatedProgress - progress) > 0.5) {
        dispatch(setProgress(calculatedProgress));
      }
    }

    animationRef.current = requestAnimationFrame(updateProgress);
  };

  // Start progress animation when song is playing
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Sync local progress with Redux when seeking
  const handleProgressChange = (value) => {
    if (!audioRef.current) return;

    const duration = audioRef.current.duration;
    if (!isNaN(duration)) {
      audioRef.current.currentTime = (value[0] / 100) * duration;
    }

    setLocalProgress(value[0]);
    dispatch(setProgress(value[0]));
  };

  // Handle song ending - play next song
  const handleSongEnd = () => {
    dispatch(setProgress(0));
    // If we have more songs in the queue, play the next one
    if (queue.length > 1) {
      dispatch(nextSong());
    } else {
      // If we don't have more songs, just stop playing
      dispatch(togglePlayPause());
    }
  };

  // Handle next song button click
  const handleNextSong = () => {
    setHasUserInteracted(true);
    dispatch(setProgress(0));
    dispatch(nextSong());
  };

  // Handle previous song button click
  const handlePreviousSong = () => {
    setHasUserInteracted(true);
    // If we're more than 3 seconds into the song, go back to the start of the current song
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      dispatch(setProgress(0));
    } else {
      // Otherwise go to the previous song
      dispatch(setProgress(0));
      dispatch(previousSong());
    }
  };

  // Save state in sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "playerState",
        JSON.stringify({
          currentSong,
          isPlaying,
          volume,
          progress,
          queue,
          queueIndex,
        })
      );
    }
  }, [currentSong, isPlaying, volume, progress, queue, queueIndex]);

  // Load the stored progress when the song starts playing
  useEffect(() => {
    if (!audioRef.current || !isHydrated || isLoadingRef.current) return;

    if (currentSong && currentSong.downloadUrl) {
      const audioUrl =
        currentSong.downloadUrl.find((url) => url.quality === "320kbps")?.url ||
        currentSong.downloadUrl[currentSong.downloadUrl.length - 1]?.url;

      if (audioUrl && audioRef.current.src !== audioUrl) {
        isLoadingRef.current = true;
        
        audioRef.current.pause();
        audioRef.current.src = audioUrl;
        audioRef.current.load();

        // Restore progress time after loading
        audioRef.current.onloadedmetadata = () => {
          if (!isNaN(audioRef.current.duration)) {
            audioRef.current.currentTime =
              (progress / 100) * audioRef.current.duration;
          }
          isLoadingRef.current = false;
        };

        // Don't auto-play - audio will be ready when user clicks play
      }
    }
  }, [currentSong, isHydrated, progress, isPlaying]);

  // Check if next/prev buttons should be disabled
  const isQueueEmpty = !queue || queue.length === 0;

  // Show full-screen player if active
  if (showFullScreen && currentSong) {
    return (
      <>
        {/* Keep the bottom player's audio element active but hidden */}
        <div className="hidden">
          <audio ref={audioRef} onEnded={handleSongEnd} />
        </div>
        <FullScreenPlayer 
          onClose={() => {
            setShowFullScreen(false);
            // Ensure the song continues playing in the background
            // The bottom player will automatically resume playing
          }}
        />
      </>
    );
  }

  // Show loading state during hydration to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="relative w-full bg-background p-3 border-t flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center  gap-4 min-w-0 flex-1">
            <div className="h-14 w-14 bg-muted rounded-md animate-pulse" />
            <div className="truncate">
              <div className="h-4 bg-muted rounded animate-pulse mb-2 w-32" />
              <div className="h-3 bg-muted rounded animate-pulse w-24" />
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 justify-center">
            <div className="h-10 w-10 bg-muted rounded animate-pulse" />
            <div className="h-10 w-10 bg-muted rounded animate-pulse" />
            <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          </div>
          <div className="hidden sm:flex items-center gap-2 flex-1 justify-end">
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            <div className="h-2 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full bg-background p-3 border-t flex flex-col cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => currentSong && setShowFullScreen(true)}
    >
      {/* Audio Element */}
      <audio ref={audioRef} onEnded={handleSongEnd} />
      

      {/* Progress Bar */}
      <div onClick={(e) => e.stopPropagation()}>
        <Slider
          className="absolute -top-[1px] left-0 w-full h-[2px] rounded-none"
          value={[localProgress]}
          onValueChange={handleProgressChange}
          max={100}
          step={0.1} // Make it more precise
        />
      </div>
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mt-1">
            <span>{Math.floor((localProgress / 100) * (currentSong?.duration || 0) / 60)}:{(Math.floor((localProgress / 100) * (currentSong?.duration || 0)) % 60).toString().padStart(2, '0')}</span>
            <span>{Math.floor((currentSong?.duration || 0) / 60)}:{(Math.floor(currentSong?.duration || 0) % 60).toString().padStart(2, '0')}</span>
          </div>

      {/* Player Content */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Song Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <img
            src={
              currentSong?.image?.[currentSong.image.length - 1]?.url ||
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCA0MkMzNS43MzM3IDQyIDQyIDM1LjczMzcgNDIgMjhDNDIgMjAuMjY2MyAzNS43MzM3IDE0IDI4IDE0QzIwLjI2NjMgMTQgMTQgMjAuMjY2MyAxNCAyOEMxNCAzNS43MzM3IDIwLjI2NjMgNDIgMjggNDJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yNCAyMkwyNCAzNEwyOCAzMEwzMiAzNEwzMiAyMkwyNCAyMloiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+"
            }
            alt="Album cover"
            className="h-14 w-14 rounded-md"
          />
          <div className="truncate">
            <h3 className="font-semibold text-foreground truncate">
              {currentSong?.name || "No Song Playing"}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong?.artists?.primary
                ?.map((artist) => artist.name)
                .join(", ") || "Artist Name"}
            </p>
          </div>
          
          {/* Like button */}

        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handlePreviousSong();
            }}
            disabled={isQueueEmpty}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayClick();
            }}
            variant="outline"
            size="icon"
            disabled={!currentSong}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleNextSong();
            }}
            disabled={isQueueEmpty}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Right: Volume Control */}
        <div className="hidden sm:flex items-center gap-2 flex-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <Slider
            className="w-24"
            value={[volume]}
            onValueChange={(value) => dispatch(setVolume(value[0]))}
            max={100}
            step={1}
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
