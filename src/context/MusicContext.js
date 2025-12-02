import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, {
    Capability,
    State,
    RepeatMode,
    useProgress,
    usePlaybackState,
    Event,
    AppKilledPlaybackBehavior
} from 'react-native-track-player';
import { LogBox } from 'react-native';

// Suppress specific warnings
LogBox.ignoreLogs([
    'Expo AV has been deprecated',
    'Call to function',
    'Error requesting permissions',
]);

const MusicContext = createContext();

// Músicas de exemplo para o Modo de Demonstração
const MOCK_SONGS = [
    {
        id: '1',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Demonstração - Música 1',
        artist: 'Evxf Sounds',
        duration: 372,
        album: 'Álbum Demo',
        dateAdded: new Date().getTime(),
        dateModified: new Date().getTime(),
    },
    {
        id: '2',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        title: 'Demonstração - Música 2',
        artist: 'Evxf Sounds',
        duration: 425,
        album: 'Álbum Demo',
        dateAdded: new Date().getTime(),
        dateModified: new Date().getTime(),
    },
    {
        id: '3',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        title: 'Demonstração - Música 3',
        artist: 'Evxf Sounds',
        duration: 320,
        album: 'Álbum Demo',
        dateAdded: new Date().getTime(),
        dateModified: new Date().getTime(),
    },
];

export const MusicProvider = ({ children }) => {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const playbackState = usePlaybackState();
    const isPlaying = playbackState.state === State.Playing || playbackState.state === State.Buffering;

    const progress = useProgress();
    const currentTime = progress.position;
    const duration = progress.duration;

    const [repeatMode, setRepeatModeState] = useState('off');
    const [shuffle, setShuffle] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [sortBy, setSortBy] = useState('name');
    const [hasPermission, setHasPermission] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [playCounts, setPlayCounts] = useState({});
    const [isPlayerSetup, setIsPlayerSetup] = useState(false);

    const songsRef = useRef([]);
    const playCountsRef = useRef({}); // Ref para acesso imediato

    useEffect(() => { songsRef.current = songs; }, [songs]);
    useEffect(() => { playCountsRef.current = playCounts; }, [playCounts]);

    useEffect(() => {
        const init = async () => {
            await setupPlayer();
            await loadPlayCounts();
            await loadPlaylists();
            // Carrega a preferência de ordenação ANTES de carregar as músicas
            await loadSortBy();
            // A permissão e carregamento de músicas será chamado após loadSortBy terminar implicitamente
            // ou podemos chamar explicitamente aqui se loadSortBy não disparar efeito
            requestPermissions();
        };
        init();

        const sub = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
            if (event.track) {
                const originalSong = songsRef.current.find(s => s.id === event.track.id);

                setCurrentSong(prev => {
                    if (originalSong) return originalSong;
                    return {
                        ...event.track,
                        id: event.track.id,
                        uri: event.track.url,
                        title: event.track.title,
                        artist: event.track.artist,
                        duration: event.track.duration,
                        artwork: event.track.artwork,
                    };
                });

                if (event.track.id) {
                    incrementPlayCount(event.track.id);
                }
            }
        });

        return () => {
            sub.remove();
        };
    }, []);

    const setupPlayer = async () => {
        try {
            await TrackPlayer.setupPlayer();
            await TrackPlayer.updateOptions({
                android: {
                    appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                },
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.SkipToNext,
                    Capability.SkipToPrevious,
                    Capability.Stop,
                    Capability.SeekTo,
                ],
                compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
                notificationCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious, Capability.SeekTo],
            });
            setIsPlayerSetup(true);
        } catch (error) {
            // Player já configurado, ignorar erro
            setIsPlayerSetup(true);
        }
    };

    const requestPermissions = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
                setHasPermission(true);
                // Passamos o sortBy atual (que pode ter acabado de ser carregado)
                const savedSort = await AsyncStorage.getItem('sortBy');
                loadSongs(savedSort || 'name');
            } else {
                enableDemoMode();
            }
        } catch (error) {
            enableDemoMode();
        }
    };

    const enableDemoMode = () => {
        setIsDemoMode(true);
        setSongs(sortSongs(MOCK_SONGS, sortBy));
    };

    const loadSongs = async (currentSortBy = sortBy) => {
        try {
            const { status } = await MediaLibrary.getPermissionsAsync();
            if (status !== 'granted') {
                const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
                if (newStatus !== 'granted') {
                    enableDemoMode();
                    return;
                }
            }

            const media = await MediaLibrary.getAssetsAsync({
                mediaType: 'audio',
                first: 2000, // Aumentado limite para garantir que pegue todas
                sortBy: [MediaLibrary.SortBy.creationTime], // Padrão da lib, nós reordenamos depois
            });

            const songList = media.assets.map((asset) => {
                // Tenta construir URI de artwork padrão do Android
                // Nota: Em Android 10+, isso pode falhar sem permissões específicas, 
                // mas é a melhor tentativa sem libs nativas extras.
                // O componente AlbumArt lidará com o fallback se falhar.
                const artworkUri = asset.albumId ? `content://media/external/audio/albumart/${asset.albumId}` : null;

                return {
                    id: asset.id, // Mantém como string se vier da lib
                    uri: asset.uri,
                    title: asset.filename.replace(/\.[^/.]+$/, ''),
                    artist: 'Artista Desconhecido', // MediaLibrary do Expo infelizmente não retorna Artista nativamente em todas versões
                    duration: asset.duration,
                    album: 'Álbum Desconhecido',
                    artwork: artworkUri,
                    dateAdded: asset.creationTime,
                    dateModified: asset.modificationTime,
                };
            });

            setSongs(sortSongs(songList, currentSortBy));
        } catch (error) {
            console.error('Error loading songs:', error);
            enableDemoMode();
        }
    };

    const loadPlayCounts = async () => {
        try {
            const saved = await AsyncStorage.getItem('playCounts');
            if (saved) {
                const parsed = JSON.parse(saved);
                setPlayCounts(parsed);
                playCountsRef.current = parsed;
            }
        } catch (error) { }
    };

    const loadSortBy = async () => {
        try {
            const saved = await AsyncStorage.getItem('sortBy');
            if (saved) setSortBy(saved);
            return saved;
        } catch (error) { return null; }
    };

    const incrementPlayCount = async (songId) => {
        // Usa a ref para garantir que temos o valor mais atual mesmo dentro de callbacks rápidos
        const currentCounts = playCountsRef.current || {};
        const newCount = (currentCounts[songId] || 0) + 1;

        const newCountsObj = { ...currentCounts, [songId]: newCount };

        setPlayCounts(newCountsObj);
        playCountsRef.current = newCountsObj;

        await AsyncStorage.setItem('playCounts', JSON.stringify(newCountsObj));
    };

    const getTopPlayedSongs = () => {
        // Cria uma cópia e ordena
        // Importante: playCounts usa as chaves como IDs.
        const counts = playCounts;

        const songsWithPlays = songs.map(song => ({
            ...song,
            playCount: counts[song.id] || 0
        }));

        // Filtra apenas os que tem plays e ordena
        return songsWithPlays
            .filter(s => s.playCount > 0)
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, 20); // Retorna top 20
    };

    const deleteSong = async (songId) => {
        const updatedSongs = songs.filter(s => s.id !== songId);
        setSongs(updatedSongs);
        const updatedPlaylists = playlists.map(pl => ({
            ...pl,
            songs: pl.songs.filter(s => s.id !== songId)
        }));
        setPlaylists(updatedPlaylists);
        await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    };

    const sortSongs = (songList, sortType) => {
        const sorted = [...songList];
        switch (sortType) {
            case 'name': return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'dateAdded': return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            case 'dateModified': return sorted.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));
            default: return sorted;
        }
    };

    const changeSortBy = async (newSortBy) => {
        setSortBy(newSortBy);
        setSongs(sortSongs(songs, newSortBy));
        await AsyncStorage.setItem('sortBy', newSortBy);
    };

    const playSong = async (song, playlistContext = null) => {
        if (!isPlayerSetup) return;

        try {
            // Se playlistContext for passado (ex: shuffle ou playlist específica), usa ele.
            // Se não, usa a lista de músicas ATUAL (que já está ordenada conforme a tela principal)
            const queue = playlistContext || songs;

            const trackIndex = queue.findIndex(s => s.id === song.id);

            const currentQueue = await TrackPlayer.getQueue();
            // Verifica se é a mesma fila para otimização
            // Compara IDs da primeira música e tamanho da fila
            const isSameQueue = currentQueue.length === queue.length &&
                currentQueue.length > 0 &&
                currentQueue[0].id === queue[0].id;

            if (isSameQueue && trackIndex !== -1) {
                await TrackPlayer.skip(trackIndex);
                await TrackPlayer.play();
            } else {
                const tracks = queue.map(s => ({
                    id: s.id,
                    url: s.uri,
                    title: s.title,
                    artist: s.artist || 'Desconhecido',
                    artwork: s.artwork, // Passa a URI da artwork para o player (notificação)
                    duration: s.duration
                }));

                await TrackPlayer.reset();
                await TrackPlayer.add(tracks);
                if (trackIndex !== -1) {
                    await TrackPlayer.skip(trackIndex);
                }
                await TrackPlayer.play();
            }

            setCurrentSong(song);
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };

    const togglePlayPause = async () => {
        if (isPlaying) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    };

    const stopPlayer = async () => {
        await TrackPlayer.reset();
        setCurrentSong(null);
    };

    const playNext = async () => {
        await TrackPlayer.skipToNext();
    };

    const playPrevious = async () => {
        await TrackPlayer.skipToPrevious();
    };

    const seekTo = async (position) => {
        await TrackPlayer.seekTo(position);
    };

    const toggleRepeat = async () => {
        const modes = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(repeatMode);
        const newMode = modes[(currentIndex + 1) % modes.length];
        setRepeatModeState(newMode);

        let tpMode = RepeatMode.Off;
        if (newMode === 'all') tpMode = RepeatMode.Queue;
        if (newMode === 'one') tpMode = RepeatMode.Track;

        await TrackPlayer.setRepeatMode(tpMode);
    };

    const toggleShuffle = () => {
        setShuffle(!shuffle);
        // Implementação futura: Reordenar fila real do TrackPlayer
    };

    const loadPlaylists = async () => {
        try {
            const saved = await AsyncStorage.getItem('playlists');
            if (saved) setPlaylists(JSON.parse(saved));
        } catch (error) { }
    };

    const createPlaylist = async (name) => {
        const newPlaylist = {
            id: Date.now().toString(),
            name,
            songs: [],
            createdAt: new Date().toISOString(),
        };
        const updated = [...playlists, newPlaylist];
        setPlaylists(updated);
        await AsyncStorage.setItem('playlists', JSON.stringify(updated));
        return newPlaylist;
    };

    const createPlaylistWithSongs = async (name, songsToAdd) => {
        const newPlaylist = {
            id: Date.now().toString(),
            name,
            songs: songsToAdd,
            createdAt: new Date().toISOString(),
        };
        const updated = [...playlists, newPlaylist];
        setPlaylists(updated);
        await AsyncStorage.setItem('playlists', JSON.stringify(updated));
        return newPlaylist;
    };

    const addToPlaylist = async (playlistId, song) => {
        const updated = playlists.map(pl =>
            pl.id === playlistId ? { ...pl, songs: [...pl.songs, song] } : pl
        );
        setPlaylists(updated);
        await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    };

    const addMultipleToPlaylist = async (playlistId, songsToAdd) => {
        const updated = playlists.map(pl =>
            pl.id === playlistId ? { ...pl, songs: [...pl.songs, ...songsToAdd] } : pl
        );
        setPlaylists(updated);
        await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    };

    const removeFromPlaylist = async (playlistId, songId) => {
        const updated = playlists.map(pl =>
            pl.id === playlistId ? { ...pl, songs: pl.songs.filter(s => s.id !== songId) } : pl
        );
        setPlaylists(updated);
        await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    };

    const renamePlaylist = async (playlistId, newName) => {
        const updated = playlists.map(pl =>
            pl.id === playlistId ? { ...pl, name: newName } : pl
        );
        setPlaylists(updated);
        await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    };

    const deletePlaylist = async (playlistId) => {
        const updated = playlists.filter(pl => pl.id !== playlistId);
        setPlaylists(updated);
        await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    };

    const reorderPlaylist = async (playlistId, newSongsOrder) => {
        const updated = playlists.map(pl =>
            pl.id === playlistId ? { ...pl, songs: newSongsOrder } : pl
        );
        setPlaylists(updated);
        await AsyncStorage.setItem('playlists', JSON.stringify(updated));
    };

    const playShuffle = async (songsToShuffle) => {
        if (!songsToShuffle || songsToShuffle.length === 0) return;
        const shuffled = [...songsToShuffle].sort(() => Math.random() - 0.5);
        await playSong(shuffled[0], shuffled);
        setShuffle(true);
    };

    return (
        <MusicContext.Provider
            value={{
                songs,
                currentSong,
                isPlaying,
                currentTime,
                duration,
                repeatMode,
                shuffle,
                playlists,
                sortBy,
                hasPermission,
                isDemoMode,
                playCounts,
                playSong,
                stopPlayer,
                togglePlayPause,
                playNext,
                playPrevious,
                seekTo,
                toggleRepeat,
                toggleShuffle,
                changeSortBy,
                createPlaylist,
                createPlaylistWithSongs,
                addToPlaylist,
                addMultipleToPlaylist,
                removeFromPlaylist,
                deletePlaylist,
                renamePlaylist,
                reorderPlaylist,
                requestPermissions,
                loadSongs,
                getTopPlayedSongs,
                deleteSong,
                playShuffle,
            }}
        >
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusic must be used within MusicProvider');
    }
    return context;
};
