"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Download, HardDrive, Heart, MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

const SongMenu = ({ 
  song, 
  isLiked = false, 
  onToggleLike, 
  onDownload,
  onStoreOffline,
  isOffline = false,
  isStoring = false,
  className = "" 
}) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [didMove, setDidMove] = useState(false);

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

  const handleStoreOffline = (e) => {
    e.stopPropagation();
    onStoreOffline?.(song);
    setIsOpen(false);
  };

  const handleTouchStart = (e) => {
    setTouchStartTime(Date.now());
    if (e.touches && e.touches[0]) {
      setTouchStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setDidMove(false);
    }
  };

  const handleTouchMove = (e) => {
    if (!e.touches || !e.touches[0]) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.y);
    // If user moved finger more than 8px, treat as scroll gesture
    if (dx > 8 || dy > 8) {
      setDidMove(true);
      if (isOpen) setIsOpen(false);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    // Ignore if finger moved (scroll) or touch was too short
    if (didMove) return;
    if (Date.now() - touchStartTime >= 100) {
      setIsOpen(true);
    }
  };


  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onClick={handleClick}
          style={{ touchAction: 'manipulation' }}
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
              <span>{isLiked ? 'Remove from Liked' : 'Add to Liked'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              <span>Download</span>
            </DropdownMenuItem>
            {song?.downloadUrl && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleStoreOffline}
                disabled={isStoring}
              >
                {isStoring ? (
                  <div className="mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : isOffline ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <HardDrive className="mr-2 h-4 w-4" />
                )}
                <span>
                  {isStoring ? 'Storing...' : isOffline ? 'Available Offline' : 'Store Offline'}
                </span>
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => window.location.href = "/login"}
          >
            <Heart className="mr-2 h-4 w-4" />
            <span>Sign in to like songs</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SongMenu;
