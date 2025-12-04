import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Modal,
    ScrollView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useProgress } from 'react-native-track-player';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { useLanguage } from '../context/LanguageContext';
import { AlbumArt } from '../components/AlbumArt';
import { CustomAlert } from '../components/CustomAlert';

const { width } = Dimensions.get('window');

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Slider simplificado ao máximo
const ProgressSlider = ({ seekTo, theme }) => {
    const { position, duration } = useProgress(1000);
    const [localPosition, setLocalPosition] = useState(0);
    const isSlidingRef = useRef(false);

    useEffect(() => {
        if (!isSlidingRef.current) {
            setLocalPosition(position);
        }
    }, [position]);

    return (
        <View style={styles.progressWrapper}>
            <Slider
                style={styles.slider}
                value={localPosition}
                minimumValue={0}
                maximumValue={duration > 0 ? duration : 1}
                onSlidingStart={() => {
                    isSlidingRef.current = true;
                }}
                onValueChange={(value) => {
                    setLocalPosition(value);
                }}
                onSlidingComplete={(value) => {
                    seekTo(value);
                    isSlidingRef.current = false;
                }}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.textSecondary + '50'}
                thumbTintColor={theme.primary}
            />
            <View style={styles.timeContainer}>
                <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                    {formatTime(localPosition)}
                </Text>
                <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                    {formatTime(duration)}
                </Text>
            </View>
        </View>
    );
};

export const PlayerScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const {
        currentSong,
        isPlaying,
        repeatMode,
        shuffle,
        playlists,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        toggleRepeat,
        toggleShuffle,
        addToPlaylist,
        deleteFromDevice,
    } = useMusic();

    const [showOptions, setShowOptions] = useState(false);
    const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        buttons: []
    });

    const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => { } }]) => {
        setAlertConfig({ visible: true, title, message, buttons });
    };

    const getRepeatIcon = () => {
        switch (repeatMode) {
            case 'one': return 'repeat';
            case 'all': return 'repeat';
            default: return 'repeat';
        }
    };

    const handleDeleteFromDevice = () => {
        setShowOptions(false);
        showAlert(
            t('deleteFromDevice'),
            t('confirmDeleteFromDevice').replace('{count}', 1),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteFromDevice(currentSong.id);
                        if (success) {
                            navigation.goBack();
                            showAlert(t('success'), t('deleteSuccess'));
                        } else {
                            showAlert(t('error'), t('deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const handleAddToPlaylist = (playlist) => {
        addToPlaylist(playlist.id, currentSong);
        setShowPlaylistSelector(false);
        setShowOptions(false);
        showAlert(t('success'), `${t('addedTo')} "${playlist.name}"!`);
    };

    const gradientColors = isDarkMode
        ? [theme.background, '#1a1a1a', '#000000']
        : [theme.background, '#f5f5f5', '#e0e0e0'];

    if (!currentSong) {
        return (
            <LinearGradient colors={gradientColors} style={styles.container}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-down" size={32} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.emptyContainer}>
                    <Ionicons name="musical-notes-outline" size={80} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('noSongPlaying')}</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-down" size={32} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{t('nowPlaying')}</Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => setShowOptions(true)}>
                    <Ionicons name="ellipsis-horizontal" size={28} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.artworkWrapper}>
                <View style={[styles.artworkShadow, { shadowColor: theme.text }]}>
                    <AlbumArt
                        uri={currentSong.artwork}
                        songUri={currentSong.uri}
                        size={width * 0.7}
                        style={{ borderRadius: (width * 0.7) / 2 }}
                        backgroundColor={theme.surface}
                        iconColor={theme.textSecondary}
                        iconSize={100}
                    />
                </View>
            </View>

            <View style={styles.infoWrapper}>
                <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={1}>
                    {currentSong.title}
                </Text>
                <Text style={[styles.artistName, { color: theme.textSecondary }]} numberOfLines={1}>
                    {currentSong.artist}
                </Text>
            </View>

            <ProgressSlider seekTo={seekTo} theme={theme} />

            <View style={styles.controlsWrapper}>
                <TouchableOpacity onPress={toggleShuffle} style={styles.secondaryControl}>
                    <Ionicons name="shuffle" size={28} color={shuffle ? theme.primary : theme.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={playPrevious} style={styles.mainControl}>
                    <Ionicons name="play-skip-back" size={42} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={togglePlayPause}
                    style={[styles.playPauseButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                >
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={48} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity onPress={playNext} style={styles.mainControl}>
                    <Ionicons name="play-skip-forward" size={42} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleRepeat} style={styles.secondaryControl}>
                    <Ionicons name={getRepeatIcon()} size={28} color={repeatMode !== 'off' ? theme.primary : theme.textSecondary} />
                    {repeatMode === 'one' && (
                        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                            <Text style={styles.badgeText}>1</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <Modal
                visible={showOptions}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowOptions(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOptions(false)}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('options')}</Text>
                        </View>
                        <TouchableOpacity style={styles.modalOption} onPress={() => { setShowOptions(false); setShowPlaylistSelector(true); }}>
                            <Ionicons name="add-circle-outline" size={24} color={theme.text} />
                            <Text style={[styles.modalOptionText, { color: theme.text }]}>{t('addToPlaylist')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleDeleteFromDevice}>
                            <Ionicons name="trash-outline" size={24} color={theme.error} />
                            <Text style={[styles.modalOptionText, { color: theme.error }]}>{t('deleteFromDevice')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowOptions(false)}>
                            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={showPlaylistSelector}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPlaylistSelector(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPlaylistSelector(false)}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface, maxHeight: '60%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('selectPlaylist')}</Text>
                        </View>
                        <ScrollView>
                            {playlists.map(playlist => (
                                <TouchableOpacity key={playlist.id} style={styles.modalOption} onPress={() => handleAddToPlaylist(playlist)}>
                                    <Ionicons name="list" size={24} color={theme.primary} />
                                    <Text style={[styles.modalOptionText, { color: theme.text }]}>{playlist.name}</Text>
                                </TouchableOpacity>
                            ))}
                            {playlists.length === 0 && (
                                <Text style={{ padding: 20, textAlign: 'center', color: theme.textSecondary }}>{t('noPlaylists')}</Text>
                            )}
                        </ScrollView>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPlaylistSelector(false)}>
                            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerButton: {
        padding: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    closeButton: {
        alignSelf: 'flex-start',
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 20,
        marginTop: 20,
        fontWeight: '500',
    },
    artworkWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30,
    },
    artworkShadow: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
        borderRadius: 1000,
    },
    infoWrapper: {
        alignItems: 'center',
        paddingHorizontal: 30,
        marginBottom: 30,
    },
    songTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    artistName: {
        fontSize: 18,
        textAlign: 'center',
        opacity: 0.8,
    },
    progressWrapper: {
        width: '100%',
        paddingHorizontal: 25,
        marginBottom: 20,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -5,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    controlsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginBottom: 40,
    },
    playPauseButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    mainControl: {
        padding: 10,
    },
    secondaryControl: {
        padding: 10,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 14,
        height: 14,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#FFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        paddingBottom: 40,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150,150,150,0.1)',
        paddingBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    modalOptionText: {
        fontSize: 16,
        marginLeft: 15,
    },
    cancelButton: {
        marginTop: 20,
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(150,150,150,0.1)',
        borderRadius: 12,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
