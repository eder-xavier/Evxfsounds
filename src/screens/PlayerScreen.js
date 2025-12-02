import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Modal,
    Alert,
    ScrollView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/colors';
import { AlbumArt } from '../components/AlbumArt';
import { CustomAlert } from '../components/CustomAlert';

const { width } = Dimensions.get('window');

export const PlayerScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        repeatMode,
        shuffle,
        playlists,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        toggleRepeat,
        toggleShuffle,
        deleteSong,
        addToPlaylist,
        deleteFromDevice,
    } = useMusic();

    const [showOptions, setShowOptions] = useState(false);
    const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);

    // Estados para CustomAlert
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        buttons: []
    });

    // Estados para o Slider (Fix de delay)
    const [sliderValue, setSliderValue] = useState(0);
    const [isSliding, setIsSliding] = useState(false);

    // Atualiza o slider apenas se o usuário não estiver arrastando
    useEffect(() => {
        if (!isSliding) {
            setSliderValue(currentTime);
        }
    }, [currentTime, isSliding]);

    const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => { } }]) => {
        setAlertConfig({ visible: true, title, message, buttons });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getRepeatIcon = () => {
        switch (repeatMode) {
            case 'one':
                return 'repeat-outline';
            case 'all':
                return 'repeat';
            default:
                return 'repeat';
        }
    };

    const handleDeleteFromDevice = () => {
        setShowOptions(false);
        showAlert(
            'Excluir Arquivo',
            'Tem certeza que deseja DELETAR PERMANENTEMENTE este arquivo do dispositivo? Esta ação não pode ser desfeita!',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir Permanentemente',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteFromDevice(currentSong.id, currentSong.uri);
                        if (success) {
                            navigation.goBack();
                        } else {
                            showAlert('Erro', 'Não foi possível excluir o arquivo.');
                        }
                    }
                }
            ]
        );
    };

    const handleAddToPlaylist = (playlist) => {
        addToPlaylist(playlist.id, currentSong);
        setShowPlaylistSelector(false);
        setShowOptions(false);
        showAlert('Sucesso', `Música adicionada à playlist "${playlist.name}"!`);
    };

    if (!currentSong) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                    backgroundColor={theme.background}
                />
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-down" size={28} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.emptyContainer}>
                    <Ionicons name="musical-notes-outline" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Nenhuma música tocando
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
            />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-down" size={28} color={theme.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.text }]}>Tocando Agora</Text>

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => setShowOptions(true)}
                >
                    <Ionicons name="ellipsis-horizontal" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.artworkContainer}>
                <AlbumArt
                    uri={currentSong.artwork}
                    size={width - 80}
                    style={{ borderRadius: BORDER_RADIUS.xl }}
                    backgroundColor={theme.primary}
                    iconColor={theme.surface}
                    iconSize={120}
                />
            </View>

            <View style={styles.infoContainer}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                    {currentSong.title}
                </Text>
                <Text style={[styles.artist, { color: theme.textSecondary }]} numberOfLines={1}>
                    {currentSong.artist}
                </Text>
            </View>

            <View style={styles.progressContainer}>
                <Slider
                    style={styles.slider}
                    value={sliderValue}
                    minimumValue={0}
                    maximumValue={duration || 1}
                    onSlidingStart={() => setIsSliding(true)}
                    onValueChange={(value) => setSliderValue(value)}
                    onSlidingComplete={(value) => {
                        setIsSliding(false);
                        seekTo(value);
                    }}
                    minimumTrackTintColor={theme.progressBar}
                    maximumTrackTintColor={theme.progressBg}
                    thumbTintColor={theme.progressBar}
                />
                <View style={styles.timeContainer}>
                    <Text style={[styles.time, { color: theme.textSecondary }]}>
                        {formatTime(sliderValue)}
                    </Text>
                    <Text style={[styles.time, { color: theme.textSecondary }]}>
                        {formatTime(duration)}
                    </Text>
                </View>
            </View>

            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={toggleShuffle}
                >
                    <Ionicons
                        name={shuffle ? 'shuffle' : 'shuffle-outline'}
                        size={24}
                        color={shuffle ? theme.primary : theme.textSecondary}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={playPrevious}
                >
                    <Ionicons name="play-skip-back" size={36} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.playButton, { backgroundColor: theme.primary }]}
                    onPress={togglePlayPause}
                >
                    <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={40}
                        color={theme.surface}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={playNext}
                >
                    <Ionicons name="play-skip-forward" size={36} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={toggleRepeat}
                >
                    <Ionicons
                        name={getRepeatIcon()}
                        size={24}
                        color={repeatMode !== 'off' ? theme.primary : theme.textSecondary}
                    />
                    {repeatMode === 'one' && (
                        <View style={[styles.repeatBadge, { backgroundColor: theme.primary }]}>
                            <Text style={[styles.repeatBadgeText, { color: theme.surface }]}>1</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Options Modal */}
            <Modal
                visible={showOptions}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowOptions(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowOptions(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Opções</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setShowOptions(false);
                                setShowPlaylistSelector(true);
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={24} color={theme.text} />
                            <Text style={[styles.modalOptionText, { color: theme.text }]}>Adicionar à Playlist</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleDeleteFromDevice}
                        >
                            <Ionicons name="trash-outline" size={24} color={theme.error} />
                            <Text style={[styles.modalOptionText, { color: theme.error }]}>Excluir do Dispositivo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowOptions(false)}
                        >
                            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Playlist Selector Modal */}
            <Modal
                visible={showPlaylistSelector}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPlaylistSelector(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPlaylistSelector(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.surface, maxHeight: '50%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Escolha uma Playlist</Text>
                        </View>

                        <ScrollView>
                            {playlists.map(playlist => (
                                <TouchableOpacity
                                    key={playlist.id}
                                    style={styles.modalOption}
                                    onPress={() => handleAddToPlaylist(playlist)}
                                >
                                    <Ionicons name="list" size={24} color={theme.primary} />
                                    <Text style={[styles.modalOptionText, { color: theme.text }]}>{playlist.name}</Text>
                                </TouchableOpacity>
                            ))}
                            {playlists.length === 0 && (
                                <Text style={{ padding: 20, textAlign: 'center', color: theme.textSecondary }}>
                                    Nenhuma playlist criada.
                                </Text>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowPlaylistSelector(false)}
                        >
                            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancelar</Text>
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

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: SPACING.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    headerButton: {
        padding: SPACING.sm,
    },
    headerTitle: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
    },
    closeButton: {
        alignSelf: 'flex-start',
        padding: SPACING.md,
        marginLeft: SPACING.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: FONT_SIZES.lg,
        marginTop: SPACING.md,
    },
    artworkContainer: {
        alignItems: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
    },
    artwork: {
        width: width - 80,
        height: width - 80,
        borderRadius: BORDER_RADIUS.xl,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    infoContainer: {
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZES['3xl'],
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    artist: {
        fontSize: FONT_SIZES.lg,
        textAlign: 'center',
    },
    progressContainer: {
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -SPACING.sm,
    },
    time: {
        fontSize: FONT_SIZES.sm,
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
        gap: SPACING.lg,
    },
    playButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    controlButton: {
        padding: SPACING.sm,
    },
    secondaryButton: {
        padding: SPACING.sm,
        position: 'relative',
    },
    repeatBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    repeatBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalOptionText: {
        fontSize: FONT_SIZES.base,
        marginLeft: SPACING.md,
    },
    cancelButton: {
        marginTop: SPACING.lg,
        alignItems: 'center',
        padding: SPACING.md,
    },
    cancelButtonText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
    },
});
