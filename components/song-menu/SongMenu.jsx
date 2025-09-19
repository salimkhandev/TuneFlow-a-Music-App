"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Download, Heart, MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

const SongMenu = ({ 
  song, 
  isLiked = false, 
  onToggleLike, 
  onDownload,
  className = "" 
}) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

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


  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
          onClick={(e) => e.stopPropagation()}
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
