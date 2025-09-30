import { nextSong, previousSong, togglePlayPause } from '@/lib/slices/playerSlice';
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Default artwork fallback
const DEFAULT_ARTWORK = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTYgNDA4QzMzNy4zMzMgNDA4IDQwOCAzMzcuMzMzIDQwOCAyNTZDNDA4IDE3NC42NjcgMzM3LjMzMyAxMDQgMjU2IDEwNEMxNzQuNjY3IDEwNCAxMDQgMTc0LjY2NyAxMDQgMjU2QzEwNCAzMzcuMzMzIDE3NC42NjcgNDA4IDI1NiA0MDhaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xOTIgMjA4TDE5MiAzMjBMMjU2IDI4OEwzMjAgMzIwTDMyMCAyMDhMMTkyIDIwOFoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+";

export function useMediaSession() {
  const dispatch = useDispatch();
  const { currentSong, isPlaying } = useSelector((state) => state.player);
  const audioRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const lastPositionUpdate = useRef(0);
  const positionIntervalRef = useRef(null);
  const metadataRef = useRef(null);

  // Get audio element once on mount
  useEffect(() => {
    audioRef.current = document.querySelector('audio');
    return () => {
      audioRef.current = null;
    };
  }, []);

  // Memoized action handlers to prevent recreation
  const handlePlay = useCallback(() => {
    if (!isUpdatingRef.current) {
      isUpdatingRef.current = true;
      dispatch(togglePlayPause());
      requestAnimationFrame(() => {
        isUpdatingRef.current = false;
      });
    }
  }, [dispatch]);

  const handlePause = useCallback(() => {
    if (!isUpdatingRef.current) {
      isUpdatingRef.current = true;
      dispatch(togglePlayPause());
      requestAnimationFrame(() => {
        isUpdatingRef.current = false;
      });
    }
  }, [dispatch]);

  const handlePrevious = useCallback(() => {
    dispatch(previousSong());
  }, [dispatch]);

  const handleNext = useCallback(() => {
    dispatch(nextSong());
  }, [dispatch]);

  const handleSeekBackward = useCallback((details) => {
    if (audioRef.current) {
      const seekTime = details?.seekTime || 10;
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seekTime);
    }
  }, []);

  const handleSeekForward = useCallback((details) => {
    if (audioRef.current) {
      const seekTime = details?.seekTime || 10;
      const duration = audioRef.current.duration || 0;
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + seekTime);
    }
  }, []);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      dispatch(togglePlayPause());
    }
  }, [dispatch]);

  // Optimized position update with throttling
  const updatePositionState = useCallback(() => {
    if (!audioRef.current || !("mediaSession" in navigator)) return;

    const now = Date.now();
    // Throttle updates to every 250ms minimum
    if (now - lastPositionUpdate.current < 250) return;

    const { duration, currentTime, playbackRate = 1 } = audioRef.current;

    if (!isNaN(duration) && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate,
          position: currentTime
        });
        lastPositionUpdate.current = now;
      } catch (error) {
        // Silently handle errors to avoid console spam
      }
    }
  }, []);

  // Initialize and update Media Session
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    // Only update metadata if song actually changed
    if (currentSong) {
      const newMetadata = {
        title: currentSong.name || "Unknown Song",
        artist: currentSong.artists?.primary?.map(a => a.name).join(", ") || "Unknown Artist",
        album: currentSong.album?.name || "Unknown Album",
      };

      // Check if metadata actually changed
      const metadataChanged = !metadataRef.current ||
        metadataRef.current.title !== newMetadata.title ||
        metadataRef.current.artist !== newMetadata.artist ||
        metadataRef.current.album !== newMetadata.album;

      if (metadataChanged) {
        const artwork = currentSong?.image?.[currentSong.image.length - 1]?.url || DEFAULT_ARTWORK;

        navigator.mediaSession.metadata = new MediaMetadata({
          ...newMetadata,
          artwork: [
            { src: artwork, sizes: "512x512", type: "image/jpeg" },
            { src: artwork, sizes: "256x256", type: "image/jpeg" },
            { src: artwork, sizes: "128x128", type: "image/jpeg" }
          ]
        });

        metadataRef.current = newMetadata;
      }

      // Set up action handlers only once per song
      navigator.mediaSession.setActionHandler("play", handlePlay);
      navigator.mediaSession.setActionHandler("pause", handlePause);
      navigator.mediaSession.setActionHandler("previoustrack", handlePrevious);
      navigator.mediaSession.setActionHandler("nexttrack", handleNext);
      navigator.mediaSession.setActionHandler("seekbackward", handleSeekBackward);
      navigator.mediaSession.setActionHandler("seekforward", handleSeekForward);
      navigator.mediaSession.setActionHandler("stop", handleStop);
    }

    return () => {
      if ("mediaSession" in navigator && !currentSong) {
        navigator.mediaSession.metadata = null;
        metadataRef.current = null;
      }
    };
  }, [currentSong, handlePlay, handlePause, handlePrevious, handleNext, handleSeekBackward, handleSeekForward, handleStop]);

  // Update playback state separately for better performance
  useEffect(() => {
    if ("mediaSession" in navigator && !isUpdatingRef.current) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  // Optimized position state updates
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    // Clear any existing interval
    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
    }

    // Reset position for new song
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      lastPositionUpdate.current = 0;
    }

    // Immediate update
    updatePositionState();

    // Use requestAnimationFrame for smooth updates when playing
    let rafId = null;
    const updateLoop = () => {
      if (isPlaying) {
        updatePositionState();
        rafId = requestAnimationFrame(updateLoop);
      }
    };

    if (isPlaying) {
      rafId = requestAnimationFrame(updateLoop);
    }

    // Fallback interval for when not playing (less frequent)
    if (!isPlaying) {
      positionIntervalRef.current = setInterval(updatePositionState, 1000);
    }

    // Listen to seek events for immediate updates
    const handleSeeked = () => {
      lastPositionUpdate.current = 0; // Force immediate update
      updatePositionState();
    };

    audioRef.current?.addEventListener('seeked', handleSeeked);
    audioRef.current?.addEventListener('loadedmetadata', updatePositionState);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
      audioRef.current?.removeEventListener('seeked', handleSeeked);
      audioRef.current?.removeEventListener('loadedmetadata', updatePositionState);
    };
  }, [currentSong, isPlaying, updatePositionState]);
}