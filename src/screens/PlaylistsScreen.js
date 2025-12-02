import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    StatusBar,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { useLanguage } from '../context/LanguageContext';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/colors';
import { CustomAlert } from '../components/CustomAlert';

export const PlaylistsScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const { playlists, createPlaylist, deletePlaylist, renamePlaylist } = useMusic();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [playlistName, setPlaylistName] = useState('');

    // Estados para o menu de opções
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPlaylists = playlists.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => { } }]) => {
        setAlertConfig({ visible: true, title, message, buttons });
    };

    const handleCreatePlaylist = async () => {
        if (playlistName.trim()) {
            await createPlaylist(playlistName.trim());
            setPlaylistName('');
            setShowCreateModal(false);
            showAlert(t('success'), t('playlistCreated'));
        }
    };

    const handleDeletePlaylist = (playlist) => {
        setShowOptionsModal(false);
        showAlert(
            t('deletePlaylist'),
            `${t('confirmDeletePlaylist')} "${playlist.name}"?`,
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: () => deletePlaylist(playlist.id),
                },
            ]
        );
    };

    const handleRename = () => {
        if (newName.trim() && selectedPlaylist) {
            renamePlaylist(selectedPlaylist.id, newName.trim());
            setShowRenameModal(false);
            setNewName('');
        }
    };

    const openOptions = (playlist) => {
        setSelectedPlaylist(playlist);
        setShowOptionsModal(true);
    };

    const openRename = () => {
        setNewName(selectedPlaylist.name);
        setShowOptionsModal(false);
        setShowRenameModal(true);
    };

    const renderPlaylistItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.playlistItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('PlaylistDetail', { playlist: item })}
            onLongPress={() => openOptions(item)}
        >
            <View style={[styles.playlistIcon, { backgroundColor: theme.primary, overflow: 'hidden' }]}>
                {item.songs.length > 0 && item.songs[0].artwork ? (
                    <Image
                        source={{ uri: item.songs[0].artwork }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                ) : (
                    <Ionicons name="list" size={28} color={theme.surface} />
                )}
            </View>
            <View style={styles.playlistInfo}>
                <Text style={[styles.playlistName, { color: theme.text }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.playlistCount, { color: theme.textSecondary }]}>
                    {item.songs.length} {item.songs.length === 1 ? t('song') : t('songs')}
                </Text>
            </View>
            <TouchableOpacity onPress={() => openOptions(item)} style={{ padding: 8 }}>
                <Ionicons name="ellipsis-vertical" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderOptionsModal = () => (
        <Modal
            visible={showOptionsModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowOptionsModal(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowOptionsModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {selectedPlaylist?.name}
                    </Text>

                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={openRename}
                    >
                        <Ionicons name="pencil" size={24} color={theme.text} />
                        <Text style={[styles.optionText, { color: theme.text }]}>{t('rename')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => handleDeletePlaylist(selectedPlaylist)}
                    >
                        <Ionicons name="trash" size={24} color={theme.error} />
                        <Text style={[styles.optionText, { color: theme.error }]}>{t('delete')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionItem, { borderBottomWidth: 0 }]}
                        onPress={() => setShowOptionsModal(false)}
                    >
                        <Ionicons name="close" size={24} color={theme.textSecondary} />
                        <Text style={[styles.optionText, { color: theme.textSecondary }]}>{t('cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderRenameModal = () => (
        <Modal
            visible={showRenameModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowRenameModal(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowRenameModal(false)}
            >
                <View
                    style={[styles.modalContainer, { backgroundColor: theme.surface }]}
                    onStartShouldSetResponder={() => true}
                >
                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {t('renamePlaylist')}
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.background,
                                color: theme.text,
                                borderColor: theme.border,
                            },
                        ]}
                        placeholder={t('newName')}
                        placeholderTextColor={theme.textSecondary}
                        value={newName}
                        onChangeText={setNewName}
                        autoFocus
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: theme.background }]}
                            onPress={() => setShowRenameModal(false)}
                        >
                            <Text style={[styles.modalButtonText, { color: theme.text }]}>
                                {t('cancel')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: theme.primary }]}
                            onPress={handleRename}
                        >
                            <Text style={[styles.modalButtonText, { color: theme.surface }]}>
                                {t('save')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderCreateModal = () => (
        <Modal
            visible={showCreateModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCreateModal(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowCreateModal(false)}
            >
                <View
                    style={[styles.modalContainer, { backgroundColor: theme.surface }]}
                    onStartShouldSetResponder={() => true}
                >
                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {t('newPlaylist')}
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.background,
                                color: theme.text,
                                borderColor: theme.border,
                            },
                        ]}
                        placeholder={t('playlistName')}
                        placeholderTextColor={theme.textSecondary}
                        value={playlistName}
                        onChangeText={setPlaylistName}
                        autoFocus
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: theme.background }]}
                            onPress={() => {
                                setPlaylistName('');
                                setShowCreateModal(false);
                            }}
                        >
                            <Text style={[styles.modalButtonText, { color: theme.text }]}>
                                {t('cancel')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: theme.primary }]}
                            onPress={handleCreatePlaylist}
                        >
                            <Text style={[styles.modalButtonText, { color: theme.surface }]}>
                                {t('create')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            <View style={[
                styles.header,
                {
                    backgroundColor: theme.surface,
                    borderBottomColor: theme.border,
                    paddingTop: insets.top + SPACING.sm,
                }
            ]}>
                <View style={{ flex: 1, marginRight: SPACING.md }}>
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
                    style={[styles.createButton, { backgroundColor: theme.primary }]}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Ionicons name="add" size={24} color={theme.surface} />
                </TouchableOpacity>
            </View>

            {filteredPlaylists.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="list-outline" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        {t('noPlaylists')}
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                        {t('tapToCreate')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredPlaylists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPlaylistItem}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
                />
            )}

            {renderCreateModal()}
            {renderOptionsModal()}
            {renderRenameModal()}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: FONT_SIZES['2xl'],
        fontWeight: 'bold',
    },
    createButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING.md,
    },
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    playlistIcon: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    playlistInfo: {
        flex: 1,
    },
    playlistName: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        marginBottom: 4,
    },
    playlistCount: {
        fontSize: FONT_SIZES.sm,
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
    modalButtonText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: SPACING.md,
    },
    optionText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '500',
    },
});
