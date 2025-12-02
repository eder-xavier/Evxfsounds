import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/colors';
import { AlbumArt } from './AlbumArt';

export const MiniPlayer = ({ onPress, hasTabBar = true }) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { currentSong, isPlaying, togglePlayPause, playNext, playPrevious, stopPlayer } = useMusic();

    const pan = useRef(new Animated.ValueXY()).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                if (Math.abs(gestureState.dx) > 100) {
                    Animated.parallel([
                        Animated.timing(pan, {
                            toValue: { x: gestureState.dx > 0 ? 500 : -500, y: 0 },
                            duration: 200,
                            useNativeDriver: false,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: false,
                        }),
                    ]).start(() => {
                        stopPlayer();
                        pan.setValue({ x: 0, y: 0 });
                        opacity.setValue(1);
                    });
                } else {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    const tabBarHeight = 60 + (insets.bottom > 0 ? insets.bottom : 0);
    const bottomOffset = hasTabBar ? tabBarHeight : 0;

    if (!currentSong) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.playerBg,
                    borderTopColor: theme.border,
                    bottom: bottomOffset,
                    paddingBottom: hasTabBar ? SPACING.sm : Math.max(insets.bottom, SPACING.sm),
                    height: 60 + (hasTabBar ? 0 : Math.max(insets.bottom, 0)),
                    transform: [{ translateX: pan.x }],
                    opacity: opacity,
                }
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity
                style={styles.contentContainer}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <View style={styles.songInfo}>
                    <AlbumArt
                        uri={currentSong.artwork}
                        songUri={currentSong.uri}
                        size={40}
                        style={{ borderRadius: BORDER_RADIUS.sm, marginRight: SPACING.md }}
                        backgroundColor={theme.primary}
                        iconColor={theme.surface}
                        iconSize={24}
                    />
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                            {currentSong.title}
                        </Text>
                        <Text style={[styles.artist, { color: theme.textSecondary }]} numberOfLines={1}>
                            {currentSong.artist}
                        </Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
                        <Ionicons name="play-skip-back" size={24} color={theme.playerControls} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={28}
                            color={theme.playerControls}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={playNext} style={styles.controlButton}>
                        <Ionicons name="play-skip-forward" size={24} color={theme.playerControls} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderTopWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 100,
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
    },
    songInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
        marginBottom: 2,
    },
    artist: {
        fontSize: FONT_SIZES.sm,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    controlButton: {
        padding: SPACING.xs,
    },
});
