import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/colors';
import { AlbumArt } from './AlbumArt';

export const SongItem = ({ song, onPress, onLongPress, isPlaying, isSelectionMode, isSelected, onDrag }) => {
    const { theme } = useTheme();

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
                    borderBottomColor: theme.border
                }
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            {isSelectionMode ? (
                <View style={[
                    styles.selectionCircle,
                    {
                        borderColor: isSelected ? theme.primary : theme.textSecondary,
                        backgroundColor: isSelected ? theme.primary : 'transparent'
                    }
                ]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color={theme.surface} />}
                </View>
            ) : (
                <AlbumArt
                    uri={song.artwork}
                    songUri={song.uri}
                    size={48}
                    style={{ borderRadius: BORDER_RADIUS.sm, marginRight: SPACING.md }}
                    backgroundColor={theme.primary}
                    iconColor={theme.surface}
                    isPlaying={isPlaying}
                />
            )}

            <View style={styles.infoContainer}>
                <Text
                    style={[styles.title, { color: isPlaying ? theme.primary : theme.text }]}
                    numberOfLines={1}
                >
                    {song.title}
                </Text>
                <Text style={[styles.artist, { color: theme.textSecondary }]} numberOfLines={1}>
                    {song.artist}
                </Text>
            </View>

            <View style={styles.rightContainer}>
                <Text style={[styles.duration, { color: theme.textSecondary }]}>
                    {formatDuration(song.duration)}
                </Text>
                {!isSelectionMode && (
                    <TouchableOpacity onPress={onLongPress} style={styles.menuButton}>
                        <Ionicons name="ellipsis-vertical" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    infoContainer: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
        marginBottom: 4,
    },
    artist: {
        fontSize: FONT_SIZES.sm,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    duration: {
        fontSize: FONT_SIZES.sm,
    },
    menuButton: {
        padding: SPACING.xs,
    },
    selectionCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
});
