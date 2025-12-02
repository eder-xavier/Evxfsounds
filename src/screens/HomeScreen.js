import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    StatusBar,
    TextInput,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { SongItem } from '../components/SongItem';
import { useLanguage } from '../context/LanguageContext';
import { CustomAlert } from '../components/CustomAlert';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/colors';

export const HomeScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const { songs, currentSong, playSong, sortBy, changeSortBy, playlists, addToPlaylist, addMultipleToPlaylist, createPlaylist, createPlaylistWithSongs, playShuffle, loadSongs, deleteFromDevice } = useMusic();

    const [showSortMenu, setShowSortMenu] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [showSongMenu, setShowSongMenu] = useState(false);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
    const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => { } }]) => {
        setAlertConfig({ visible: true, title, message, buttons });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSongs();
        setRefreshing(false);
    };

    const sortOptions = [
        { value: 'name', label: t('name'), icon: 'text' },
        { value: 'dateAdded', label: t('dateAdded'), icon: 'calendar' },
        { value: 'dateModified', label: t('dateModified'), icon: 'time' },
    ];

    const handleSongPress = (song) => {
        if (isSelectionMode) {
            toggleSelection(song);
        } else {
            playSong(song);
        }
    };

    const handleSongLongPress = (song) => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedSongs([song.id]);
        } else {
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

    const handleAddToPlaylist = (playlist) => {
        if (selectedSong) {
            addToPlaylist(playlist.id, selectedSong);
            setShowSongMenu(false);
            showAlert(t('success'), `${t('addedTo')} "${playlist.name}"`);
        }
    };

    const handleAddMultipleToPlaylist = (playlist) => {
        const songsToAdd = songs.filter(s => selectedSongs.includes(s.id));
        addMultipleToPlaylist(playlist.id, songsToAdd);
        setShowPlaylistSelector(false);
        cancelSelection();
        showAlert(t('success'), `${songsToAdd.length} ${t('songs')} ${t('addedTo')} "${playlist.name}"`);
    };

    const handleCreateAndAdd = async () => {
        try {
            if (newPlaylistName.trim()) {
                let songsToAdd = [];
                if (isSelectionMode && selectedSongs.length > 0) {
                    songsToAdd = songs.filter(s => selectedSongs.includes(s.id));
                } else if (selectedSong) {
                    songsToAdd = [selectedSong];
                }

                if (songsToAdd.length > 0) {
                    await createPlaylistWithSongs(newPlaylistName.trim(), songsToAdd);
                    showAlert(t('success'), `${songsToAdd.length} ${t('songs')} ${t('addedTo')} "${newPlaylistName.trim()}"`);
                } else {
                    await createPlaylist(newPlaylistName.trim());
                    showAlert(t('success'), t('playlistCreated'));
                }

                setNewPlaylistName('');
                setShowCreatePlaylistModal(false);
                cancelSelection();
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            showAlert(t('error'), 'Erro ao criar playlist.');
        }
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
                        const success = await deleteFromDevice(selectedSongs);
                        cancelSelection();
                        if (success) {
                            showAlert(t('success'), t('deleteSuccess'));
                        } else {
                            showAlert(t('error'), t('deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const renderSortMenu = () => (
        <Modal
            visible={showSortMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSortMenu(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowSortMenu(false)}
            >
                <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.menuTitle, { color: theme.text }]}>{t('sortBy')}</Text>
                    {sortOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.menuItem,
                                sortBy === option.value && { backgroundColor: theme.primary + '20' }
                            ]}
                            onPress={() => {
                                changeSortBy(option.value);
                                setShowSortMenu(false);
                            }}
                        >
                            <Ionicons
                                name={option.icon}
                                size={20}
                                color={sortBy === option.value ? theme.primary : theme.textSecondary}
                            />
                            <Text
                                style={[
                                    styles.menuItemText,
                                    { color: sortBy === option.value ? theme.primary : theme.text }
                                ]}
                            >
                                {option.label}
                            </Text>
                            {sortBy === option.value && (
                                <Ionicons name="checkmark" size={20} color={theme.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderSongMenu = () => (
        <Modal
            visible={showSongMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSongMenu(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowSongMenu(false)}
            >
                <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.menuTitle, { color: theme.text }]}>
                        {selectedSong?.title}
                    </Text>

                    {playlists.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                                {t('addToPlaylist')}
                            </Text>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setShowSongMenu(false);
                                    setShowCreatePlaylistModal(true);
                                }}
                            >
                                <Ionicons name="add" size={20} color={theme.primary} />
                                <Text style={[styles.menuItemText, { color: theme.primary }]}>
                                    {t('newPlaylist')}
                                </Text>
                            </TouchableOpacity>
                            {playlists.map((playlist) => (
                                <TouchableOpacity
                                    key={playlist.id}
                                    style={styles.menuItem}
                                    onPress={() => handleAddToPlaylist(playlist)}
                                >
                                    <Ionicons name="list" size={20} color={theme.textSecondary} />
                                    <Text style={[styles.menuItemText, { color: theme.text }]}>
                                        {playlist.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setShowSongMenu(false)}
                    >
                        <Ionicons name="close" size={20} color={theme.error} />
                        <Text style={[styles.menuItemText, { color: theme.error }]}>{t('cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderCreatePlaylistModal = () => (
        <Modal
            visible={showCreatePlaylistModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCreatePlaylistModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.menuTitle, { color: theme.text }]}>{t('newPlaylist')}</Text>
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
                            onPress={() => setShowCreatePlaylistModal(false)}
                        >
                            <Text style={{ color: theme.text }}>{t('cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: theme.primary }]}
                            onPress={handleCreateAndAdd}
                        >
                            <Text style={{ color: theme.surface }}>{t('create')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderPlaylistSelector = () => (
        <Modal
            visible={showPlaylistSelector}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPlaylistSelector(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowPlaylistSelector(false)}
            >
                <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.menuTitle, { color: theme.text }]}>
                        {t('addToPlaylist')}...
                    </Text>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: 10 }]}
                        onPress={() => {
                            setShowPlaylistSelector(false);
                            setShowCreatePlaylistModal(true);
                        }}
                    >
                        <Ionicons name="add" size={24} color={theme.primary} />
                        <Text style={[styles.menuItemText, { color: theme.primary, fontWeight: 'bold' }]}>
                            {t('newPlaylist')}
                        </Text>
                    </TouchableOpacity>

                    {playlists.length > 0 ? (
                        playlists.map((playlist) => (
                            <TouchableOpacity
                                key={playlist.id}
                                style={styles.menuItem}
                                onPress={() => handleAddMultipleToPlaylist(playlist)}
                            >
                                <Ionicons name="list" size={20} color={theme.textSecondary} />
                                <Text style={[styles.menuItemText, { color: theme.text }]}>
                                    {playlist.name}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={{ color: theme.textSecondary, padding: 10 }}>
                            Nenhuma playlist criada.
                        </Text>
                    )}

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setShowPlaylistSelector(false)}
                    >
                        <Ionicons name="close" size={20} color={theme.error} />
                        <Text style={[styles.menuItemText, { color: theme.error }]}>{t('cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
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
            <View style={{ flexDirection: 'row', gap: SPACING.lg, alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={() => setShowPlaylistSelector(true)}
                    disabled={selectedSongs.length === 0}
                >
                    <Ionicons name="add-circle" size={28} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleDeleteFromDevice}
                    disabled={selectedSongs.length === 0}
                >
                    <Ionicons name="trash" size={28} color={theme.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>
                        {t('myMusic')}
                    </Text>
                    <Text style={[styles.songCount, { color: theme.textSecondary }]}>
                        {filteredSongs.length} {filteredSongs.length === 1 ? t('song') : t('songs')}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.shuffleButton, { backgroundColor: theme.primary }]}
                    onPress={() => playShuffle(filteredSongs)}
                >
                    <Ionicons name="shuffle" size={20} color={theme.surface} />
                    <Text style={{ color: theme.surface, fontWeight: '600', marginLeft: 4 }}>{t('shuffle')}</Text>
                </TouchableOpacity>
            </View>
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
                        <View style={{ flex: 1, marginRight: SPACING.sm }}>
                            <TextInput
                                style={{
                                    backgroundColor: theme.background,
                                    borderRadius: BORDER_RADIUS.full,
                                    paddingHorizontal: SPACING.md,
                                    paddingVertical: SPACING.sm,
                                    color: theme.text,
                                    fontSize: FONT_SIZES.base
                                }}
                                placeholder={t('search')}
                                placeholderTextColor={theme.textSecondary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.sortButton}
                            onPress={() => setShowSortMenu(true)}
                        >
                            <Ionicons name="filter" size={24} color={theme.primary} />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {filteredSongs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="musical-notes-outline" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        {t('noSongs')}
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                        {t('addSongs')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredSongs}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SongItem
                            song={item}
                            onPress={() => handleSongPress(item)}
                            onLongPress={() => handleSongLongPress(item)}
                            isPlaying={currentSong?.id === item.id}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedSongs.includes(item.id)}
                        />
                    )}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: 100 + insets.bottom },
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.primary}
                            colors={[theme.primary]}
                        />
                    }
                />
            )}

            {renderSortMenu()}
            {renderSongMenu()}
            {renderPlaylistSelector()}
            {renderCreatePlaylistModal()}
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
    sortButton: {
        padding: SPACING.xs,
    },
    header: {
        padding: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        marginBottom: 4,
    },
    songCount: {
        fontSize: FONT_SIZES.sm,
    },
    listContent: {
        paddingBottom: SPACING.lg,
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        width: '80%',
        maxWidth: 400,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        maxHeight: '70%',
    },
    menuTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        marginTop: SPACING.sm,
        marginBottom: SPACING.xs,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.xs,
        gap: SPACING.md,
    },
    menuItemText: {
        fontSize: FONT_SIZES.base,
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZES.base,
        marginBottom: SPACING.lg,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: SPACING.md,
    },
    modalButton: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
    },
    shuffleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
});
