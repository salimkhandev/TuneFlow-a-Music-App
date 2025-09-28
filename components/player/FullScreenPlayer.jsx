"use client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  nextSong,
  previousSong,
  setProgress,
  togglePlayPause
} from "@/lib/slices/playerSlice";
import {
  ArrowLeft,
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const FullScreenPlayer = ({ onClose }) => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { currentSong, isPlaying, volume, progress, queue, queueIndex } =
    useSelector((state) => state.player);
  // No audio ref needed - uses bottom player's audio
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

  // Handle browser back button to close fullscreen player
  useEffect(() => {
    let hasPushedState = false;

    const handlePopState = (event) => {
      // Only close if we've pushed our state and user is going back
      if (hasPushedState) {
        onClose();
      }
    };

    // Listen for popstate events (back button)
    window.addEventListener('popstate', handlePopState);

    // Add a dummy state to the history to detect back button
    // Use requestAnimationFrame to ensure it happens after the component is fully mounted
    const pushState = () => {
      window.history.pushState({ fullscreenPlayer: true }, '');
      hasPushedState = true;
    };

    const timeoutId = setTimeout(pushState, 200);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('popstate', handlePopState);
      // Clean up the history state if component unmounts
      if (hasPushedState && window.history.state?.fullscreenPlayer) {
        window.history.back();
      }
    };
  }, [onClose]);

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

  // Get reference to the bottom player's audio element
  const getAudioElement = () => {
    return document.querySelector('audio');
  };

  // Ensure shared audio element allows CORS for proxied stream
  useEffect(() => {
    const el = getAudioElement();
    if (el) {
      el.crossOrigin = 'anonymous';
      // keep preload aggressive to reduce start latency
      el.preload = 'auto';
    }
  }, []);

  // Auto-play when full-screen opens
  useEffect(() => {
    if (isHydrated && currentSong && hasUserInteracted) {
      // Ensure the song starts playing when full-screen opens
      const audioElement = getAudioElement();
      if (audioElement && isPlaying) {
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Auto-playing in full screen");
            })
            .catch((err) => {
              if (err.name !== 'AbortError') {
                console.error("Auto-play failed:", err);
              }
            });
        }
      }
    }
  }, [isHydrated, currentSong, hasUserInteracted, isPlaying]);

  // Handle play/pause - control bottom player's audio
  useEffect(() => {
    const audioElement = getAudioElement();
    if (!audioElement || !isHydrated) return;

    if (isPlaying && hasUserInteracted) {
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio started playing in full screen");
          })
          .catch((err) => {
            if (err.name !== 'AbortError') {
              console.error("Playback failed:", err);
            }
          });
      }
    } else if (!isPlaying) {
      audioElement.pause();
    }
  }, [isPlaying, isHydrated, hasUserInteracted]);

  // Handle volume changes
  useEffect(() => {
    const audioElement = getAudioElement();
    if (audioElement) {
      audioElement.volume = volume / 100;
    }
  }, [volume]);

  // Sync local progress with Redux progress
  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  // Handle progress seeking - control bottom player's audio directly
  const handleProgressChange = (value) => {
    setLocalProgress(value[0]);
    dispatch(setProgress(value[0]));
    
    // Update the audio element directly
    const audioElement = getAudioElement();
    if (audioElement && !isNaN(audioElement.duration)) {
      const duration = audioElement.duration;
      audioElement.currentTime = (value[0] / 100) * duration;
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
    // Go to the previous song (bottom player handles the 3-second logic)
    dispatch(setProgress(0));
    dispatch(previousSong());
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
    
    <div className="absolute inset-0 bg-background z-50 flex flex-col overflow-hidden">
      {/* No separate audio element - uses the bottom player's audio */}
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 flex-shrink-0 min-h-[60px] sm:min-h-[70px] md:min-h-[80px]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-foreground hover:bg-muted h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </Button>
        
        <div className="text-center">
          <p className="text-sm sm:text-base text-muted-foreground">Playing from</p>
          <p className="text-base sm:text-lg font-medium">Liked Songs</p>
        </div>
        
        <div className="w-8 sm:w-10 md:w-12" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 min-h-0 max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-140px)] md:max-h-[calc(100vh-160px)]">
        {/* Album Art */}
        <div className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 mb-3 sm:mb-4 shadow-2xl flex-shrink-0">
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
        <div className="text-center mb-2 sm:mb-3 max-w-xs sm:max-w-md px-4 flex-shrink-0">
          <h1 className="text-sm sm:text-lg md:text-xl font-bold text-foreground mb-1 line-clamp-2">
            {currentSong?.name || "No Song Playing"}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-2">
            {currentSong?.artists?.primary
              ?.map((artist) => artist.name)
              .join(", ") || "Artist Name"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleLike}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8 touch-manipulation"
          >
            <Heart
              className={`w-3 h-3 sm:w-4 sm:h-4 ${isSongLiked(currentSong.id) ? 'fill-red-500' : ''
                }`}
            />
          </Button>
        </div>
        
        <div className="w-full max-w-xs sm:max-w-md mb-2 sm:mb-3 px-4 flex-shrink-0">
          <Slider
            value={[localProgress]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mt-1">
            <span>{Math.floor((localProgress / 100) * (currentSong?.duration || 0) / 60)}:{(Math.floor((localProgress / 100) * (currentSong?.duration || 0)) % 60).toString().padStart(2, '0')}</span>
            <span>{Math.floor((currentSong?.duration || 0) / 60)}:{(Math.floor(currentSong?.duration || 0) % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousSong}
            disabled={isQueueEmpty}
            className="text-foreground hover:bg-muted h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 touch-manipulation"
          >
            <SkipBack className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </Button>
          
          <Button
            onClick={() => {
              setHasUserInteracted(true);
              dispatch(togglePlayPause());
            }}
            size="icon"
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary hover:bg-primary/90 touch-manipulation"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
            ) : (
              <Play className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 ml-0.5 sm:ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextSong}
            disabled={isQueueEmpty}
            className="text-foreground hover:bg-muted h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 touch-manipulation"
          >
            <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </Button>
        </div>

        {/* Action Buttons */}

      </div>

      {/* Volume Control */}
 
    </div>
  );
};

export default FullScreenPlayer;
