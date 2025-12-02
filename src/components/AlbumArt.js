import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AlbumArt = ({ uri, size = 48, style, iconSize, iconColor = '#fff', backgroundColor = '#6366f1', isPlaying = false }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Se não tem URI ou deu erro, mostrar ícone
    if (!uri || imageError) {
        return (
            <View style={[
                {
                    width: size,
                    height: size,
                    backgroundColor: backgroundColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                style
            ]}>
                <Ionicons
                    name={isPlaying ? 'volume-high' : 'musical-notes'}
                    size={iconSize || size * 0.5}
                    color={iconColor}
                />
            </View>
        );
    }

    return (
        <View style={[{ width: size, height: size }, style]}>
            <Image
                source={{ uri }}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                resizeMode="cover"
                onError={() => {
                    console.log('Image load error for URI:', uri);
                    setImageError(true);
                }}
                onLoad={() => setImageLoaded(true)}
            />
            {/* Mostrar ícone enquanto carrega */}
            {!imageLoaded && !imageError && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: backgroundColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Ionicons
                        name="musical-notes"
                        size={iconSize || size * 0.5}
                        color={iconColor}
                    />
                </View>
            )}
        </View>
    );
};
