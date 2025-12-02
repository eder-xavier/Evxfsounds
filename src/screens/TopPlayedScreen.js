import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { SongItem } from '../components/SongItem';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/colors';

export const TopPlayedScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();
    const { getTopPlayedSongs, playSong, currentSong, playShuffle } = useMusic();
    const topSongs = getTopPlayedSongs();
    const [expandedStats, setExpandedStats] = useState(false);

    const getTotalPlays = () => {
        return topSongs.reduce((sum, song) => sum + song.playCount, 0);
    };

    const getMostPlayedCount = () => {
        return topSongs.length > 0 ? topSongs[0].playCount : 0;
    };

    const renderRankBadge = (index) => {
        const colors = {
            0: ['#FFD700', '#FFA500'], // Ouro
            1: ['#C0C0C0', '#A8A8A8'], // Prata
            2: ['#CD7F32', '#8B4513'], // Bronze
        };

        if (index < 3) {
            return (
                <LinearGradient
                    colors={colors[index]}
                    style={styles.medalBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="trophy" size={16} color="#FFF" />
                    <Text style={styles.medalText}>{index + 1}</Text>
                </LinearGradient>
            );
        }

        return (
            <View style={[styles.rankBadge, { backgroundColor: theme.surface }]}>
                <Text style={[styles.rankText, { color: theme.textSecondary }]}>
                    {index + 1}
                </Text>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerSection}>
            <LinearGradient
                colors={[theme.primary + '20', 'transparent']}
                style={styles.gradientHeader}
            >
                <View style={styles.statsCard}>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="musical-notes" size={32} color={theme.primary} />
                            <Text style={[styles.statValue, { color: theme.text }]}>
                                {topSongs.length}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                Músicas
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="play-circle" size={32} color={theme.primary} />
                            <Text style={[styles.statValue, { color: theme.text }]}>
                                {getTotalPlays()}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                Reproduções
                            </Text>
                        </View>
                        {topSongs.length > 0 && (
                            <View style={styles.statItem}>
                                <Ionicons name="star" size={32} color={theme.warning} />
                                <Text style={[styles.statValue, { color: theme.text }]}>
                                    {getMostPlayedCount()}
                                </Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                    Top #1
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {topSongs.length > 0 && (
                    <TouchableOpacity
                        style={[styles.shuffleButton, { backgroundColor: theme.primary }]}
                        onPress={() => playShuffle(topSongs)}
                    >
                        <Ionicons name="shuffle" size={20} color="#FFF" />
                        <Text style={styles.shuffleButtonText}>Tocar Aleatório</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>
        </View>
    );

    const renderSongItem = ({ item, index }) => (
        <View style={styles.itemContainer}>
            <View style={styles.rankContainer}>
                {renderRankBadge(index)}
            </View>
            <View style={{ flex: 1 }}>
                <SongItem
                    song={item}
                    onPress={() => playSong(item)}
                    isPlaying={currentSong?.id === item.id}
                />
            </View>
            <View style={styles.countContainer}>
                <Ionicons name="play" size={12} color={theme.textSecondary} />
                <Text style={[styles.count, { color: theme.textSecondary }]}>
                    {item.playCount}
                </Text>
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

            <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
                <View style={styles.headerContent}>
                    <Ionicons name="stats-chart" size={32} color={theme.primary} />
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>
                            Mais Tocadas
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Suas músicas favoritas
                        </Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={topSongs}
                keyExtractor={item => item.id}
                renderItem={renderSongItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <LinearGradient
                            colors={[theme.primary + '10', 'transparent']}
                            style={styles.emptyGradient}
                        >
                            <Ionicons name="headset-outline" size={80} color={theme.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.text }]}>
                                Comece a ouvir música!
                            </Text>
                            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                                Suas músicas mais tocadas aparecerão aqui
                            </Text>
                        </LinearGradient>
                    </View>
                }
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: 100 + insets.bottom }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: FONT_SIZES['3xl'],
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: FONT_SIZES.base,
        marginTop: 4,
    },
    headerSection: {
        marginBottom: SPACING.lg,
    },
    gradientHeader: {
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginHorizontal: SPACING.lg,
    },
    statsCard: {
        marginBottom: SPACING.md,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        gap: SPACING.xs,
    },
    statValue: {
        fontSize: FONT_SIZES['2xl'],
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: FONT_SIZES.sm,
    },
    shuffleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.sm,
    },
    shuffleButtonText: {
        color: '#FFF',
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
    },
    listContent: {
        flexGrow: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: SPACING.md,
    },
    rankContainer: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.sm,
    },
    medalBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    medalText: {
        color: '#FFF',
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
    },
    rankBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
    },
    countContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        minWidth: 50,
        justifyContent: 'flex-end',
        paddingRight: SPACING.xs,
    },
    count: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        marginTop: 60,
    },
    emptyGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.xl,
        marginHorizontal: SPACING.lg,
    },
    emptyText: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        marginTop: SPACING.lg,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: FONT_SIZES.base,
        marginTop: SPACING.sm,
        textAlign: 'center',
    },
});
