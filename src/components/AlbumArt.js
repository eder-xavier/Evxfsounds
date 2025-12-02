import React, { useState, useEffect, useRef } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEmbeddedArtworkAsFile } from '../utils/AudioMetadata';

export const AlbumArt = ({
    uri,
    songUri, // URI do arquivo de áudio para fallback nativo
    size = 48,
    style,
    iconSize,
    iconColor = '#fff',
    backgroundColor = '#6366f1',
    isPlaying = false
}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [nativeArtworkUri, setNativeArtworkUri] = useState(null);
    const [nativeAttempted, setNativeAttempted] = useState(false); // Evita loop
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Tenta carregar artwork nativo quando a URI padrão falha
    useEffect(() => {
        // Só tenta uma vez - se já tentou e falhou, não tenta de novo
        if (imageError && songUri && !nativeAttempted) {
            setNativeAttempted(true); // Marca que já tentou

            getEmbeddedArtworkAsFile(songUri)
                .then(artwork => {
                    if (artwork && isMounted.current) {
                        setNativeArtworkUri(artwork);
                        setImageError(false); // Reset error para tentar com nova URI
                        setImageLoaded(false); // Reset loaded para recarregar
                    }
                })
                .catch(err => {
                    console.log('Native artwork extraction failed:', err);
                });
        }
    }, [imageError, songUri, nativeAttempted]);

    // Reset states quando a URI muda
    useEffect(() => {
        setImageError(false);
        setImageLoaded(false);
        setNativeArtworkUri(null);
        setNativeAttempted(false);
    }, [uri, songUri]);

    // Decide qual URI usar
    const effectiveUri = nativeArtworkUri || uri;

    // Se não tem URI ou deu erro em ambas as tentativas, mostrar ícone
    const shouldShowIcon = !effectiveUri || (imageError && nativeAttempted);

    if (shouldShowIcon) {
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
            {effectiveUri && (
                <Image
                    source={{ uri: effectiveUri }}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    resizeMode="cover"
                    onError={() => {
                        if (isMounted.current) {
                            setImageError(true);
                        }
                    }}
                    onLoad={() => {
                        if (isMounted.current) {
                            setImageLoaded(true);
                        }
                    }}
                />
            )}
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
