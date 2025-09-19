"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fetchAlbums,
  fetchArtists,
  fetchPlaylists,
  fetchSongs,
} from "@/lib/utils";
import { debounce } from "lodash";
import { Music, Search } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import AlbumsList from "../albums-list/AlbumsList";
import { ArtistCard } from "../artist-card/ArtistCard";
import CustomThemeSwitcher from "../CustomThemeSwitcher";
import Loader from "../loader/Loader";
import { ModeToggle } from "../mode-toggler/ModeToggler";
import { PlaylistCard } from "../playlist-card/PlaylistCard";
import { SongList } from "../song-list/SongList";

const Header = () => {
  const { data: session } = useSession();
  // Search-related states
  const [query, setQuery] = useState("");
  const [isOpenSearchDialog, setIsOpenSearchDialog] = useState(false);
  const [limit] = useState(10);

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

  return (
    <header className="flex flex-col md:flex-row items-center justify-between p-3 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left Side: Logo */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Music className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Musix</h1>
        </div>

        {/* Middle: Search Bar (Hidden on Small Screens) */}
        <div className="hidden sm:flex items-center gap-4 flex-1 max-w-md">
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

        {/* Right Side: Mode Toggle & Mobile Search Button */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Icon */}
          <Button
            size="icon"
            variant="outline"
            className="sm:hidden"
            onClick={() => setIsOpenSearchDialog(true)}
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Mode Toggle */}
          <ModeToggle />

          {/* Custom Theme Switcher */}
          <CustomThemeSwitcher />

          {session?.user ? (
            <div className="flex items-center gap-2">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
              <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => signIn("google", { callbackUrl: "/" })}>Sign in</Button>
          )}
        </div>
      </div>

      <Dialog
        open={isOpenSearchDialog}
        onOpenChange={() => {
          setIsOpenSearchDialog(false);
          setQuery("");
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
          <Input
            placeholder="Type songs, artists, or playlists or search..."
            value={query}
            onChange={(e) => {
              const searchQuery = e.target.value;
              setQuery(searchQuery);
              debouncedSearch(searchQuery);
            }}
          />
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
