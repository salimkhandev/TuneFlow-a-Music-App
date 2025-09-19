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
    ArrowLeft,
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

const FullScreenPlayer = ({ onClose }) => {
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

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

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

  // Check if next/prev buttons should be disabled
  const isQueueEmpty = !queue || queue.length === 0;

  // Show loading state during hydration to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentSong) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-background z-50 flex flex-col">
      {/* Audio Element */}
      <audio ref={audioRef} onEnded={handleSongEnd} />
      
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Playing from</p>
          <p className="font-medium">Liked Songs</p>
        </div>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Album Art */}
        <div className="w-80 h-80 mb-8 shadow-2xl">
          <img
            src={
              currentSong?.image?.[currentSong.image.length - 1]?.url ||
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMyMCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgMjQwQzIwNS40NjQgMjQwIDI0MCAyMDUuNDY0IDI0MCAxNjBDMjQwIDExNC41MzYgMjA1LjQ2NCA4MCAxNjAgODBDMTE0LjUzNiA4MCA4MCAxMTQuNTM2IDgwIDE2MEM4MCAyMDUuNDY0IDExNC41MzYgMjQwIDE2MCAyNDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMzYgMTI4TDEzNiAxOTJMMTYwIDE3NkwxODQgMTkyTDE4NCAxMjhMMTM2IDEyOFoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+"
            }
            alt="Album cover"
            className="w-full h-full rounded-lg object-cover"
          />
        </div>

        {/* Song Info */}
        <div className="text-center mb-8 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {currentSong?.name || "No Song Playing"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {currentSong?.artists?.primary
              ?.map((artist) => artist.name)
              .join(", ") || "Artist Name"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-8">
          <Slider
            value={[localProgress]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{Math.floor((localProgress / 100) * (currentSong?.duration || 0) / 60)}:{(Math.floor((localProgress / 100) * (currentSong?.duration || 0)) % 60).toString().padStart(2, '0')}</span>
            <span>{Math.floor((currentSong?.duration || 0) / 60)}:{(Math.floor(currentSong?.duration || 0) % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousSong}
            disabled={isQueueEmpty}
            className="text-foreground hover:bg-muted"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            onClick={() => {
              setHasUserInteracted(true);
              dispatch(togglePlayPause());
            }}
            size="icon"
            className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextSong}
            disabled={isQueueEmpty}
            className="text-foreground hover:bg-muted"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleLike}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Heart 
              className={`w-6 h-6 ${
                isSongLiked(currentSong.id) ? 'fill-red-500' : ''
              }`} 
            />
          </Button>
          
          <Button variant="outline" onClick={handleDownload}>
            Download
          </Button>
        </div>
      </div>

      {/* Volume Control */}
      <div className="p-6">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <Slider
            className="flex-1"
            value={[volume]}
            onValueChange={(value) => dispatch(setVolume(value[0]))}
            max={100}
            step={1}
          />
          <span className="text-sm text-muted-foreground w-12 text-right">
            {volume}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default FullScreenPlayer;
