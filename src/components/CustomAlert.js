import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/colors';

export const CustomAlert = ({ visible, title, message, buttons = [], onClose }) => {
    const { theme } = useTheme();

    if (!visible) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {buttons.map((btn, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                ]}
                                onPress={() => {
                                    if (btn.onPress) btn.onPress();
                                    // Se o botão não tiver onPress ou se quiser fechar sempre:
                                    // onClose(); 
                                    // Mas geralmente o onPress do botão controla o fluxo, então deixamos o onClose para o Modal
                                }}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    { color: theme.primary },
                                    btn.style === 'cancel' && { color: theme.textSecondary },
                                    btn.style === 'destructive' && { color: theme.error }
                                ]}>
                                    {btn.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    container: {
        width: '100%',
        maxWidth: 320,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
    },
    message: {
        fontSize: FONT_SIZES.base,
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: SPACING.sm,
        flexWrap: 'wrap',
    },
    button: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    buttonText: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
    },
});
