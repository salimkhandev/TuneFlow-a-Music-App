"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Download, Heart, MoreHorizontal, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const SongMenu = ({ 
  song, 
  isLiked = false, 
  onToggleLike, 
  onDownload,
  onStoreOffline,
  onRemoveOffline,
  isOffline = false,
  isStoring = false,
  showOfflineOptions = false,
  className = "" 
}) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(Boolean(hasTouch));
    }
  }, []);
  const isOnline = useSelector((state) => state.network.netAvail);

  const handleToggleLike = (e) => {
    e.stopPropagation();
    if (!session?.user) {
      // Redirect to sign in if not authenticated
      window.location.href = "/login";
      return;
    }
    onToggleLike?.(song);
    setIsOpen(false);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    onDownload?.(song);
    setIsOpen(false);
  };

  // const handleStoreOffline = (e) => {
  //   e.stopPropagation();
  //   onStoreOffline?.(song);
  //   setIsOpen(false);
  // };

  const handleRemoveOffline = (e) => {
    e.stopPropagation();
    onRemoveOffline?.(song.id);
    setIsOpen(false);
  };



  const handleClick = (e) => {
    e.stopPropagation();
    if (isTouchDevice) {
      // On touch devices, only long-press opens (handled via touch events)
      return;
    }
    setIsOpen((prev) => !prev);
  };  

  const handleTouchStart = (e) => {
    e.stopPropagation();
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => setIsOpen(true), 400);
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    clearTimeout(longPressTimerRef.current);
  };

  const handleTouchCancel = () => {
    clearTimeout(longPressTimerRef.current);
  };


  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <div ref={dropdownRef}>
        <DropdownMenuTrigger asChild>
        <Button
            variant="unstyled"
          size="icon"
            className={`h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-transparent focus:outline-none active:bg-transparent ${className}`}
          onClick={handleClick}
          type="button"
          aria-pressed={isOpen}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          style={{ touchAction: 'manipulation' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {session?.user ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleToggleLike}
            >
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{isLiked ? 'Unlike' : 'Like'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              <span>Download</span>
            </DropdownMenuItem>
            {/* {showOfflineOptions && song?.downloadUrl && !isOffline && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleStoreOffline}
                disabled={isStoring}
              >
                {isStoring ? (
                  <div className="mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <HardDrive className="mr-2 h-4 w-4" />
                )}
                <span>
                  {isStoring ? 'Storing...' : 'Store Offline'}
                </span>
              </DropdownMenuItem>
            )} */}
            {showOfflineOptions && isOffline && (
              <DropdownMenuItem
                className="cursor-pointer text-red-500 hover:text-red-700"
                onClick={handleRemoveOffline}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Offline</span>
              </DropdownMenuItem>
            )}
          
          </>
        )  : isOnline ? (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => window.location.href = "/login"}
          >
            <Heart className="mr-2 h-4 w-4" />
            <span>Sign in to like songs</span>
          </DropdownMenuItem>
          ) : (
            showOfflineOptions && isOffline && (
              <DropdownMenuItem
                className="cursor-pointer text-red-500 hover:text-red-700"
                onClick={handleRemoveOffline}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Offline</span>
              </DropdownMenuItem>
            )
          )}
      </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
};

export default SongMenu;
