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
    // isPlaying agora deriva do estado do player, mas mantemos um local para sincronia rápida UI
    const playbackState = usePlaybackState();
    const isPlaying = playbackState.state === State.Playing || playbackState.state === State.Buffering;

    const progress = useProgress();
    const currentTime = progress.position;
    const duration = progress.duration;

    const [repeatMode, setRepeatModeState] = useState('off'); // 'off', 'one', 'all'
    const [shuffle, setShuffle] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [sortBy, setSortBy] = useState('name');
    const [hasPermission, setHasPermission] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [playCounts, setPlayCounts] = useState({});
    const [isPlayerSetup, setIsPlayerSetup] = useState(false);

    const songsRef = useRef([]);
    useEffect(() => { songsRef.current = songs; }, [songs]);

    useEffect(() => {
        setupPlayer();
        requestPermissions();
        loadPlaylists();
        loadPlayCounts();
        loadSortBy();

        // Listener para atualização de faixa (quando muda automaticamente)
        const sub = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
            if (event.track) {
                // Sincronizar currentSong com a faixa atual do TrackPlayer
                // Precisamos encontrar a música completa no nosso array 'songs' ou reconstruí-la
                // O objeto 'track' do TrackPlayer tem propriedades limitadas que passamos

                // Usar ref para buscar na lista atualizada
                const originalSong = songsRef.current.find(s => s.id === event.track.id);

                setCurrentSong(prev => {
                    if (originalSong) return originalSong;

                    // Tenta achar na lista completa para ter todos os metadados
                    // Se não achar (ex: lista mudou), usa os dados do track mesmo
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
            console.log('Player setup error (might be already setup):', error);
            setIsPlayerSetup(true);
        }
    };

    const requestPermissions = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
                setHasPermission(true);
                loadSongs();
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

    const loadSongs = async () => {
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
                first: 1000,
            });

            const songList = media.assets.map((asset) => ({
                id: asset.id,
                uri: asset.uri,
                title: asset.filename.replace(/\.[^/.]+$/, ''),
                artist: 'Unknown Artist',
                duration: asset.duration,
                album: 'Unknown Album',
                artwork: asset.albumId ? `content://media/external/audio/albumart/${asset.albumId}` : null,
                dateAdded: asset.creationTime,
                dateModified: asset.modificationTime,
            }));

            setSongs(sortSongs(songList, sortBy));
        } catch (error) {
            console.error('Error loading songs:', error);
            enableDemoMode();
        }
    };

    const loadPlayCounts = async () => {
        try {
            const saved = await AsyncStorage.getItem('playCounts');
            if (saved) setPlayCounts(JSON.parse(saved));
        } catch (error) { }
    };

    const loadSortBy = async () => {
        try {
            const saved = await AsyncStorage.getItem('sortBy');
            if (saved) setSortBy(saved);
        } catch (error) { }
    };

    const incrementPlayCount = async (songId) => {
        const newCounts = { ...playCounts, [songId]: (playCounts[songId] || 0) + 1 };
        setPlayCounts(newCounts);
        await AsyncStorage.setItem('playCounts', JSON.stringify(newCounts));
    };

    const getTopPlayedSongs = () => {
        return [...songs]
            .map(song => ({ ...song, playCount: playCounts[song.id] || 0 }))
            .filter(song => song.playCount > 0)
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, 50);
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
            const queue = playlistContext || songs;
            const trackIndex = queue.findIndex(s => s.id === song.id);

            // Otimização: Verificar se a fila já está carregada
            const currentQueue = await TrackPlayer.getQueue();
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
                    artwork: s.artwork,
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
        // TrackPlayer não tem shuffle nativo robusto que reordena a fila sem perder o índice atual facilmente
        // Mas podemos implementar reordenando a fila. Por simplicidade, vamos manter o estado visual
        // e numa implementação futura reordenar a fila do TrackPlayer.
        // Por enquanto, apenas toggle visual
        setShuffle(!shuffle);
        // TODO: Implementar shuffle real no TrackPlayer (TrackPlayer.remove e TrackPlayer.add em ordem aleatória)
    };

    // ... Funções de Playlist (createPlaylist, addToPlaylist, etc) mantidas iguais ...
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

        // Embaralhar array
        const shuffled = [...songsToShuffle].sort(() => Math.random() - 0.5);

        // Tocar a primeira do embaralhado, mas passando a fila embaralhada como contexto
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
