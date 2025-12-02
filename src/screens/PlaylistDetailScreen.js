import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    StatusBar,
    Modal,
    TextInput,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { useLanguage } from '../context/LanguageContext';
import { SongItem } from '../components/SongItem';
import { MiniPlayer } from '../components/MiniPlayer';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/colors';
import { CustomAlert } from '../components/CustomAlert';

export const PlaylistDetailScreen = ({ route, navigation }) => {
    const { playlist: initialPlaylist } = route.params;
    const { theme, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const { currentSong, playSong, removeFromPlaylist, renamePlaylist, reorderPlaylist, playlists, playShuffle, deleteFromDevice, addMultipleToPlaylist, songs } = useMusic();

    const playlist = playlists.find(p => p.id === initialPlaylist.id) || initialPlaylist;

    const [selectedSongs, setSelectedSongs] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState(playlist.name);
    const [showAddSongsModal, setShowAddSongsModal] = useState(false);
    const [songsToAdd, setSongsToAdd] = useState([]);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

    const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => { } }]) => {
        setAlertConfig({ visible: true, title, message, buttons });
    };

    useEffect(() => {
        setNewPlaylistName(playlist.name);
    }, [playlist.name]);

    const handleSongPress = (song) => {
        if (isSelectionMode) {
            toggleSelection(song);
        } else {
            playSong(song);
        }
    };

    const handleSongLongPress = (song) => {
        if (!isSelectionMode && !isReordering) {
            setIsSelectionMode(true);
            setSelectedSongs([song.id]);
        } else if (isSelectionMode) {
            toggleSelection(song);
        }
    };

    const toggleSelection = (song) => {
        if (selectedSongs.includes(song.id)) {
            const newSelection = selectedSongs.filter(id => id !== song.id);
            setSelectedSongs(newSelection);
            if (newSelection.length === 0) {
                setIsSelectionMode(false);
            }
        } else {
            setSelectedSongs([...selectedSongs, song.id]);
        }
    };

    const cancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedSongs([]);
    };

    const handleRemoveSelected = () => {
        showAlert(
            t('removeFromPlaylist'),
            t('confirmRemoveFromPlaylist').replace('{count}', selectedSongs.length),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('remove'),
                    style: 'destructive',
                    onPress: async () => {
                        for (const songId of selectedSongs) {
                            await removeFromPlaylist(playlist.id, songId);
                        }
                        cancelSelection();
                    },
                },
            ]
        );
    };

    const handleDeleteFromDevice = () => {
        showAlert(
            t('deleteFromDevice'),
            t('confirmDeleteFromDevice').replace('{count}', selectedSongs.length),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        let successCount = 0;
                        for (const songId of selectedSongs) {
                            const song = playlist.songs.find(s => s.id === songId);
                            if (song) {
                                const success = await deleteFromDevice(songId, song.uri);
                                if (success) successCount++;
                            }
                        }
                        cancelSelection();
                        if (successCount > 0) {
                            showAlert(t('success'), t('deleteSuccess'));
                        } else {
                            showAlert(t('error'), t('deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const handleRename = () => {
        if (newPlaylistName.trim()) {
            renamePlaylist(playlist.id, newPlaylistName.trim());
            setShowRenameModal(false);
        }
    };

    const moveSong = (fromIndex, direction) => {
        const toIndex = fromIndex + direction;
        if (toIndex < 0 || toIndex >= playlist.songs.length) return;

        const newSongs = [...playlist.songs];
        const [movedSong] = newSongs.splice(fromIndex, 1);
        newSongs.splice(toIndex, 0, movedSong);

        reorderPlaylist(playlist.id, newSongs);
    };

    const handleAddSongsToPlaylist = () => {
        const songsToAddObjects = songs.filter(s => songsToAdd.includes(s.id));
        addMultipleToPlaylist(playlist.id, songsToAddObjects);
        setShowAddSongsModal(false);
        setSongsToAdd([]);
        showAlert(t('success'), `${songsToAdd.length} ${t('songs')} ${t('addedTo')}`);
    };

    const toggleSongToAdd = (songId) => {
        if (songsToAdd.includes(songId)) {
            setSongsToAdd(songsToAdd.filter(id => id !== songId));
        } else {
            setSongsToAdd([...songsToAdd, songId]);
        }
    };

    const renderAddSongsModal = () => {
        const availableSongs = songs.filter(s => !playlist.songs.some(ps => ps.id === s.id));

        return (
            <Modal
                visible={showAddSongsModal}
                animationType="slide"
                onRequestClose={() => setShowAddSongsModal(false)}
            >
                <View style={[styles.container, { backgroundColor: theme.background }]}>
                    <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: insets.top + SPACING.md, height: 'auto', paddingBottom: SPACING.md }]}>
                        <TouchableOpacity onPress={() => setShowAddSongsModal(false)}>
                            <Text style={{ color: theme.primary, fontSize: FONT_SIZES.lg }}>{t('cancel')}</Text>
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: theme.text }]}>{t('addSongsTitle')}</Text>
                        <TouchableOpacity
                            onPress={handleAddSongsToPlaylist}
                            disabled={songsToAdd.length === 0}
                        >
                            <Text style={{ color: songsToAdd.length > 0 ? theme.primary : theme.textSecondary, fontSize: FONT_SIZES.lg, fontWeight: 'bold' }}>
                                {t('add')} ({songsToAdd.length})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={availableSongs}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: theme.border }}
                                onPress={() => toggleSongToAdd(item.id)}
                            >
                                <Ionicons
                                    name={songsToAdd.includes(item.id) ? "checkbox" : "square-outline"}
                                    size={24}
                                    color={songsToAdd.includes(item.id) ? theme.primary : theme.textSecondary}
                                    style={{ marginRight: SPACING.md }}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.text, fontSize: FONT_SIZES.md, fontWeight: '500' }} numberOfLines={1}>{item.title}</Text>
                                    <Text style={{ color: theme.textSecondary, fontSize: FONT_SIZES.sm }} numberOfLines={1}>{item.artist}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ paddingBottom: 50 }}
                    />
                </View>
            </Modal>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerContent}>
            <View style={[styles.playlistIcon, { backgroundColor: theme.primary }]}>
                <Ionicons name="list" size={64} color={theme.surface} />
            </View>
            <TouchableOpacity
                style={styles.nameContainer}
                onPress={() => setShowRenameModal(true)}
            >
                <Text style={[styles.playlistName, { color: theme.text }]}>
                    {playlist.name}
                </Text>
                <Ionicons name="pencil" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.songCount, { color: theme.textSecondary }]}>
                {playlist.songs.length} {playlist.songs.length === 1 ? t('song') : t('songs')}
            </Text>

            <TouchableOpacity
                style={[styles.reorderButton, { backgroundColor: theme.surface, borderColor: theme.primary, borderWidth: 1, marginTop: SPACING.md }]}
                onPress={() => setShowAddSongsModal(true)}
            >
                <Ionicons name="add" size={20} color={theme.primary} />
                <Text style={{ color: theme.primary, fontWeight: '600', marginLeft: 8 }}>
                    {t('addSongsTitle')}
                </Text>
            </TouchableOpacity>

            {!isSelectionMode && playlist.songs.length > 1 && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: SPACING.md }}>
                    <TouchableOpacity
                        style={[
                            styles.reorderButton,
                            { backgroundColor: theme.primary, borderColor: theme.primary, marginTop: 0 }
                        ]}
                        onPress={() => playShuffle(playlist.songs)}
                    >
                        <Ionicons name="shuffle" size={20} color={theme.surface} />
                        <Text style={{ color: theme.surface, fontWeight: '600', marginLeft: 8 }}>
                            {t('shuffle')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.reorderButton,
                            { backgroundColor: isReordering ? theme.primary : theme.surface, borderColor: theme.primary, marginTop: 0 }
                        ]}
                        onPress={() => setIsReordering(!isReordering)}
                    >
                        <Ionicons
                            name={isReordering ? "checkmark" : "swap-vertical"}
                            size={20}
                            color={isReordering ? theme.surface : theme.primary}
                        />
                        <Text style={{ color: isReordering ? theme.surface : theme.primary, fontWeight: '600', marginLeft: 8 }}>
                            {isReordering ? t('done') : t('reorder')}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderSelectionHeader = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                <TouchableOpacity onPress={cancelSelection}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={{ fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: theme.text }}>
                    {selectedSongs.length}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: SPACING.lg }}>
                <TouchableOpacity
                    onPress={handleRemoveSelected}
                    disabled={selectedSongs.length === 0}
                    style={{ alignItems: 'center' }}
                >
                    <Ionicons name="remove-circle-outline" size={24} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleDeleteFromDevice}
                    disabled={selectedSongs.length === 0}
                    style={{ alignItems: 'center' }}
                >
                    <Ionicons name="trash-outline" size={24} color={theme.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderRenameModal = () => (
        <Modal
            visible={showRenameModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowRenameModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>{t('renamePlaylist')}</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                        value={newPlaylistName}
                        onChangeText={setNewPlaylistName}
                        placeholder={t('playlistName')}
                        placeholderTextColor={theme.textSecondary}
                        autoFocus
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
                            onPress={() => setShowRenameModal(false)}
                        >
                            <Text style={{ color: theme.text }}>{t('cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: theme.primary }]}
                            onPress={handleRename}
                        >
                            <Text style={{ color: theme.surface }}>{t('save')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderSongItem = ({ item, index }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ flex: 1 }}>
                <SongItem
                    song={item}
                    onPress={() => handleSongPress(item)}
                    onLongPress={() => handleSongLongPress(item)}
                    isPlaying={currentSong?.id === item.id}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedSongs.includes(item.id)}
                />
            </View>
            {isReordering && (
                <View style={{ flexDirection: 'column', paddingRight: 10, justifyContent: 'center' }}>
                    <TouchableOpacity
                        onPress={() => moveSong(index, -1)}
                        disabled={index === 0}
                        style={{ padding: 4 }}
                    >
                        <Ionicons
                            name="caret-up"
                            size={24}
                            color={index === 0 ? theme.textSecondary + '40' : theme.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => moveSong(index, 1)}
                        disabled={index === playlist.songs.length - 1}
                        style={{ padding: 4 }}
                    >
                        <Ionicons
                            name="caret-down"
                            size={24}
                            color={index === playlist.songs.length - 1 ? theme.textSecondary + '40' : theme.primary}
                        />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            <View style={[
                styles.topBar,
                {
                    backgroundColor: theme.surface,
                    borderBottomColor: theme.border,
                    paddingTop: insets.top + SPACING.sm,
                }
            ]}>
                {isSelectionMode ? renderSelectionHeader() : (
                    <>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="chevron-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                            {playlist.name}
                        </Text>
                        <View style={{ width: 40 }} />
                    </>
                )}
            </View>

            {playlist.songs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="musical-notes-outline" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        {t('emptyPlaylist')}
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                        {t('emptyPlaylistSubtext')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={playlist.songs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSongItem}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={{ paddingBottom: 100 + insets.bottom + (currentSong ? 60 : 0) }}
                />
            )}

            {renderRenameModal()}
            {renderAddSongsModal()}
            <MiniPlayer onPress={() => navigation.navigate('Player')} hasTabBar={false} />
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        minHeight: 80,
    },
    backButton: {
        padding: SPACING.xs,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    headerContent: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    playlistIcon: {
        width: 120,
        height: 120,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    playlistName: {
        fontSize: FONT_SIZES['2xl'],
        fontWeight: 'bold',
    },
    songCount: {
        fontSize: FONT_SIZES.base,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    reorderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        marginTop: SPACING.md,
    },
    selectionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeSelectionButton: {
        padding: SPACING.sm,
        marginRight: SPACING.sm,
    },
    selectionCount: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        gap: SPACING.sm,
    },
    actionButtonText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        marginTop: SPACING.md,
    },
    emptySubtext: {
        fontSize: FONT_SIZES.sm,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        maxWidth: 400,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
    },
    modalTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        marginBottom: SPACING.lg,
    },
    input: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.md,
        fontSize: FONT_SIZES.base,
        marginBottom: SPACING.lg,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    modalButton: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
        alignItems: 'center',
    },
});
