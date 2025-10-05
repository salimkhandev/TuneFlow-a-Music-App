"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  addToSearchHistory,
  clearSearchHistory,
  fetchAlbums,
  fetchArtists,
  fetchPlaylists,
  fetchSongs,
  getSearchHistory,
  removeFromSearchHistory,
} from "@/lib/utils";
import { debounce } from "lodash";
import { Clock, LogOut, Music, Search, User, WifiOff, X } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AlbumsList from "../albums-list/AlbumsList";
import { ArtistCard } from "../artist-card/ArtistCard";
import CustomThemeSwitcher from "../CustomThemeSwitcher";
import Loader from "../loader/Loader";
import { PlaylistCard } from "../playlist-card/PlaylistCard";
import { ModeToggle } from "../playlist-crousel/mode-toggler/ModeToggler";
import { SongList } from "../song-list/SongList";

const Header = () => {
  const { data: session } = useSession();
  // Search-related states
  const [query, setQuery] = useState("");
  const [isOpenSearchDialog, setIsOpenSearchDialog] = useState(false);
  const [limit] = useState(10);
  const [imageError, setImageError] = useState(false);
  
  // Search history states
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Loading states
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);

  // Results states
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);

  // Get network status from Redux store
  const isOnline = useSelector((state) => state.network.netAvail);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load search history when component mounts
  useEffect(() => {
    if (!isClient) return;
    const history = getSearchHistory();
    setSearchSuggestions(history);
  }, [isClient]);

  // Fetch songs
  const handleFetchSongs = useCallback(
    async (searchQuery) => {
      setIsLoadingSongs(true);
      try {
        const songsResponse = await fetchSongs({ query: searchQuery, limit });
        
        setSongs(songsResponse?.data?.results || []);
      } catch (error) {
        console.error("Error fetching songs:", error);
        setSongs([]);
      } finally {
        setIsLoadingSongs(false);
      }
    },
    [limit]
  );

  // Fetch playlists
  const handleFetchPlaylists = useCallback(
    async (searchQuery) => {
      setIsLoadingPlaylists(true);
      try {
        const playlistsResponse = await fetchPlaylists({
          query: searchQuery,
          limit,
        });
        setPlaylists(playlistsResponse?.data?.results || []);
      } catch (error) {
        console.error("Error fetching playlists:", error);
        setPlaylists([]);
      } finally {
        setIsLoadingPlaylists(false);
      }
    },
    [limit]
  );

  // Fetch artists
  const handleFetchArtists = useCallback(
    async (searchQuery) => {
      setIsLoadingArtists(true);
      try {
        const artistsResponse = await fetchArtists({
          query: searchQuery,
          limit,
        });
        setArtists(artistsResponse?.data?.results || []);
      } catch (error) {
        console.error("Error fetching artists:", error);
        setArtists([]);
      } finally {
        setIsLoadingArtists(false);
      }
    },
    [limit]
  );

  // Fetch albums
  const handleFetchAlbums = useCallback(
    async (searchQuery) => {
      setIsLoadingAlbums(true);
      try {
        const albumsResponse = await fetchAlbums({ query: searchQuery, limit });
        setAlbums(albumsResponse?.data?.results || []);
      } catch (error) {
        console.error("Error fetching albums:", error);
        setAlbums([]);
      } finally {
        setIsLoadingAlbums(false);
      }
    },
    [limit]
  );

  // Debounced search across all categories
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (searchQuery.trim()) {
        // Add to search history
        addToSearchHistory(searchQuery);
        
        handleFetchSongs(searchQuery);
        handleFetchPlaylists(searchQuery);
        handleFetchArtists(searchQuery);
        handleFetchAlbums(searchQuery);
      } else {
        // Reset all results if query is empty
        setSongs([]);
        setPlaylists([]);
        setArtists([]);
        setAlbums([]);
      }
    }, 300),
    [
      handleFetchSongs,
      handleFetchPlaylists,
      handleFetchArtists,
      handleFetchAlbums,
    ]
  );

  // Handle search input change with suggestions
  const handleSearchChange = (value) => {
    setQuery(value);
    
    if (value.trim()) {
      // Filter suggestions based on current input
      const history = getSearchHistory();
      const filtered = history.filter(item => 
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    debouncedSearch(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    debouncedSearch(suggestion);
  };

  // Handle suggestion remove
  const handleRemoveSuggestion = (suggestion, e) => {
    e.stopPropagation();
    removeFromSearchHistory(suggestion);
    const updatedHistory = getSearchHistory();
    setSearchSuggestions(updatedHistory);
  };

  return (
    <header className="flex items-center p-3 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left Side: Logo */}
      <div className="hidden md:flex items-center gap-2">
        <Music className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Tune Flow</h1>
      </div>

      {/* Middle: Search Bar (Hidden on Small Screens) */}
      {isOnline && (
        <div className="hidden sm:flex items-center gap-4 flex-1 max-w-md mx-4">
          <Button
            variant="secondary"
            className="relative w-full flex justify-start items-center"
            onClick={() => setIsOpenSearchDialog(true)}
          >
            <Search className="text-muted-foreground" />
            <p className="text-muted-foreground font-normal">
              Search songs, artists, or playlists...
            </p>
          </Button>
        </div>
      )}

      {/* Right Side: Mode Toggle & Mobile Search Button */}
          {/* Mobile Search Icon */}
          {isOnline && (
            <Button
              size="icon"
              variant="outline"
              className="sm:hidden"
              onClick={() => setIsOpenSearchDialog(true)}
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}
      <div className="flex items-center gap-3 ml-auto">

          {/* Mode Toggle - Hidden on Mobile, Visible on Desktop */}
          <div className="hidden sm:block">
            <ModeToggle />
          </div>

          {/* Custom Theme Switcher - Hidden on Mobile, Visible on Desktop */}
          <div className="hidden sm:block">
            <CustomThemeSwitcher />
          </div>

          {session?.user ? (
          <DropdownMenu >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8  rounded-full p-0 overflow-hidden">
                  {session.user.image && !imageError ? (
                <img
                  src={session.user.image}
                  alt="avatar"
                      className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                      onError={() => setImageError(true)}
                      onLoad={() => setImageError(false)}
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
            </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 sm:hidden">
                  <ModeToggle />
                </div>
                <div className="px-2 py-1.5 sm:hidden">
                  <CustomThemeSwitcher />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            isOnline ? (
              <Button size="sm" onClick={() => signIn("google", { callbackUrl: "/" })}>Sign in</Button>
            ) : (
              <Button size="sm" variant="outline" disabled>
                <WifiOff className="h-4 w-4 mr-2" />
                Offline
              </Button>
            )
          )}
        </div>

      <Dialog
        open={isOpenSearchDialog}
        onOpenChange={() => {
          setIsOpenSearchDialog(false);
          setQuery("");
          setShowSuggestions(false);
          // Reset all results when dialog closes
          setSongs([]);
          setPlaylists([]);
          setArtists([]);
          setAlbums([]);
        }}
        className="md:min-w-[450px]"
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search songs, artists, or playlists...
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
          <Input
            placeholder="Type songs, artists, or playlists or search..."
            value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b">
                  Recent Searches
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {suggestion}
                    </span>
                    <button
                      onClick={(e) => handleRemoveSuggestion(suggestion, e)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="p-2 border-t">
                  <button
                    onClick={() => {
                      clearSearchHistory();
                      setSearchSuggestions([]);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear History
                  </button>
                </div>
              </div>
            )}
          </div>
          <ScrollArea className="h-80 flex flex-col gap-4">
            {/* Songs Section */}
            <div className="flex flex-col gap-2">
              <h1 className="font-semibold">Songs</h1>
              {isLoadingSongs ? (
                <Loader />
              ) : (
                <SongList songs={songs} grid={true} />
              )}
              {!isLoadingSongs && songs?.length === 0 && (
                <p className="text-center">No songs found</p>
              )}
            </div>

            {/* Playlists Section */}
            <div className="flex flex-col gap-2">
              <h1 className="font-semibold">Playlists</h1>
              {isLoadingPlaylists ? (
                <Loader />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {playlists?.map((playlist, i) => (
                    <PlaylistCard key={playlist.id || i} playlist={playlist} />
                  ))}
                </div>
              )}
              {!isLoadingPlaylists && playlists?.length === 0 && (
                <p className="text-center">No playlists found</p>
              )}
            </div>

            {/* Artists Section */}
            <div className="flex flex-col gap-2">
              <h1 className="font-semibold">Artists</h1>
              {isLoadingArtists ? (
                <Loader />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {artists?.map((artist, i) => (
                    <ArtistCard key={i} artist={artist} />
                  ))}
                </div>
              )}
              {!isLoadingArtists && artists?.length === 0 && (
                <p className="text-center">No artists found</p>
              )}
            </div>

            {/* Albums Section */}
            <div className="flex flex-col gap-2">
              <h1 className="font-semibold">Albums</h1>
              {isLoadingAlbums ? <Loader /> : <AlbumsList albums={albums} />}
              {!isLoadingAlbums && albums?.length === 0 && (
                <p className="text-center">No albums found</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
