import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONT_SIZES, SPACING } from '../constants/colors';

export const Logo = () => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.logoMark}>
                {/* Ondas Esquerda */}
                <View style={[styles.waveContainer, { marginRight: -14 }]}>
                    <Ionicons
                        name="wifi"
                        size={24}
                        color={theme.primary}
                        style={{ transform: [{ rotate: '-90deg' }], opacity: 0.6 }}
                    />
                </View>

                {/* Espada Central */}
                <View style={styles.swordContainer}>
                    <MaterialCommunityIcons
                        name="sword"
                        size={36}
                        color={theme.text}
                        style={{ transform: [{ rotate: '0deg' }] }}
                    />
                </View>

                {/* Ondas Direita */}
                <View style={[styles.waveContainer, { marginLeft: -14 }]}>
                    <Ionicons
                        name="wifi"
                        size={24}
                        color={theme.primary}
                        style={{ transform: [{ rotate: '90deg' }], opacity: 0.6 }}
                    />
                </View>
            </View>

            <View style={styles.textContainer}>
                <Text style={[styles.brandName, { color: theme.text }]}>
                    Evxf <Text style={{ color: theme.primary }}>Sounds</Text>
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    logoMark: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
    },
    waveContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10, // Ajuste fino para alinhar com a lâmina
    },
    swordContainer: {
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    textContainer: {
        marginLeft: SPACING.xs,
    },
    brandName: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
