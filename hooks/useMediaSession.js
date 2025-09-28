import { nextSong, previousSong, togglePlayPause } from '@/lib/slices/playerSlice';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Default artwork fallback
const DEFAULT_ARTWORK = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTYgNDA4QzMzNy4zMzMgNDA4IDQwOCAzMzcuMzMzIDQwOCAyNTZDNDA4IDE3NC42NjcgMzM3LjMzMyAxMDQgMjU2IDEwNEMxNzQuNjY3IDEwNCAxMDQgMTc0LjY2NyAxMDQgMjU2QzEwNCAzMzcuMzMzIDE3NC42NjcgNDA4IDI1NiA0MDhaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xOTIgMjA4TDE5MiAzMjBMMjU2IDI4OEwzMjAgMzIwTDMyMCAyMDhMMTkyIDIwOFoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+";

export function useMediaSession() {
  const dispatch = useDispatch();
  const { currentSong, isPlaying } = useSelector((state) => state.player);
  const audioRef = useRef(null);
  const isUpdatingFromMediaSession = useRef(false);

  // Get the audio element reference
  useEffect(() => {
    audioRef.current = document.querySelector('audio');
  }, []);

    // Initialize Media Session API
    useEffect(() => {
        if (!("mediaSession" in navigator) || !currentSong) return;

        // Set up media session metadata
        const updateMetadata = () => {
            if (!currentSong) return;

            const artwork = currentSong?.image?.[currentSong.image.length - 1]?.url || DEFAULT_ARTWORK;

            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentSong.name || "Unknown Song",
                artist: currentSong.artists?.primary?.map(artist => artist.name).join(", ") || "Unknown Artist",
                album: currentSong.album?.name || "Unknown Album",
                artwork: [
                    { src: artwork, sizes: "512x512", type: "image/jpeg" },
                    { src: artwork, sizes: "256x256", type: "image/jpeg" },
                    { src: artwork, sizes: "128x128", type: "image/jpeg" }
                ]
            });
        };

        // Set up action handlers
        const setupActionHandlers = () => {
      // Play action
      navigator.mediaSession.setActionHandler("play", () => {
        console.log("Media Session: Play action triggered");
        if (!isUpdatingFromMediaSession.current) {
          isUpdatingFromMediaSession.current = true;
          dispatch(togglePlayPause());
          // Reset flag after a short delay
          setTimeout(() => {
            isUpdatingFromMediaSession.current = false;
          }, 100);
        }
      });

      // Pause action
      navigator.mediaSession.setActionHandler("pause", () => {
        console.log("Media Session: Pause action triggered");
        if (!isUpdatingFromMediaSession.current) {
          isUpdatingFromMediaSession.current = true;
          dispatch(togglePlayPause());
          // Reset flag after a short delay
          setTimeout(() => {
            isUpdatingFromMediaSession.current = false;
          }, 100);
        }
      });

            // Previous track action
            navigator.mediaSession.setActionHandler("previoustrack", () => {
                console.log("Media Session: Previous track action triggered");
                dispatch(previousSong());
            });

            // Next track action
            navigator.mediaSession.setActionHandler("nexttrack", () => {
                console.log("Media Session: Next track action triggered");
                dispatch(nextSong());
            });

            // Seek backward action (optional)
            navigator.mediaSession.setActionHandler("seekbackward", (details) => {
                console.log("Media Session: Seek backward action triggered", details);
                if (audioRef.current) {
                    const seekTime = details.seekTime || 10; // Default 10 seconds
                    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seekTime);
                }
            });

            // Seek forward action (optional)
            navigator.mediaSession.setActionHandler("seekforward", (details) => {
                console.log("Media Session: Seek forward action triggered", details);
                if (audioRef.current) {
                    const seekTime = details.seekTime || 10; // Default 10 seconds
                    audioRef.current.currentTime = Math.min(
                        audioRef.current.duration || 0,
                        audioRef.current.currentTime + seekTime
                    );
                }
            });

            // Stop action (optional)
            navigator.mediaSession.setActionHandler("stop", () => {
                console.log("Media Session: Stop action triggered");
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
            });
        };

        // Update metadata and setup handlers
        updateMetadata();
        setupActionHandlers();

        // Update playback state
        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

        // Cleanup function
        return () => {
            if ("mediaSession" in navigator) {
                // Clear metadata when component unmounts or song changes
                navigator.mediaSession.metadata = null;
            }
        };
    }, [currentSong, isPlaying, dispatch]);

  // Update playback state when isPlaying changes
  useEffect(() => {
    if ("mediaSession" in navigator && !isUpdatingFromMediaSession.current) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

    // Update position state for better media controls
    useEffect(() => {
        if (!("mediaSession" in navigator) || !audioRef.current || !currentSong) return;

    const updatePositionState = () => {
      if (audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
        try {
          // Only update position state if we're not in the middle of a media session update
          if (!isUpdatingFromMediaSession.current) {
            navigator.mediaSession.setPositionState({
              duration: audioRef.current.duration,
              playbackRate: audioRef.current.playbackRate || 1,
              position: audioRef.current.currentTime
            });
          }
        } catch (error) {
          console.log("Media Session position update failed:", error);
        }
      }
    };

        // Update position state more frequently for smooth progress bar
        const interval = setInterval(updatePositionState, 500);

        // Also listen to timeupdate events for real-time updates
        const handleTimeUpdate = () => {
            updatePositionState();
        };

        audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

    // Reset position state when song changes to prevent wrong progress display
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    
    // Also update immediately when song changes
    updatePositionState();

        return () => {
            clearInterval(interval);
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
            }
        };
    }, [currentSong, isPlaying]);

}
