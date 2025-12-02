import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    StatusBar,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { useLanguage } from '../context/LanguageContext';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/colors';

export const SettingsScreen = () => {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const { loadSongs, hasPermission, requestPermissions } = useMusic();
    const { t, language, changeLanguage } = useLanguage();
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);

    const languages = [
        { code: 'pt', label: 'Português' },
        { code: 'en', label: 'English' },
        { code: 'fr', label: 'Français' },
    ];

    const settingsSections = [
        {
            title: t('settings'),
            items: [
                {
                    icon: 'language',
                    label: t('language'),
                    type: 'action',
                    value: languages.find(l => l.code === language)?.label,
                    onPress: () => setShowLanguageMenu(true),
                },
            ],
        },
        {
            title: t('appearance'),
            items: [
                {
                    icon: isDarkMode ? 'moon' : 'sunny',
                    label: t('darkMode'),
                    type: 'toggle',
                    value: isDarkMode,
                    onPress: toggleTheme,
                },
            ],
        },
        {
            title: t('library'),
            items: [
                {
                    icon: 'refresh',
                    label: t('refreshLibrary'),
                    type: 'action',
                    onPress: loadSongs,
                },
                {
                    icon: hasPermission ? 'checkmark-circle' : 'close-circle',
                    label: t('mediaPermission'),
                    type: 'status',
                    value: hasPermission ? t('granted') : t('notGranted'),
                    onPress: !hasPermission ? requestPermissions : null,
                },
            ],
        },
        {
            title: t('about'),
            items: [
                {
                    icon: 'information-circle',
                    label: t('version'),
                    type: 'info',
                    value: '1.0.12',
                },
                {
                    icon: 'musical-notes',
                    label: 'Evxf Sounds',
                    type: 'info',
                    value: 'Player de Música',
                },
            ],
        },
    ];

    const renderSettingItem = (item) => {
        const isActionable = item.type === 'action' || (item.type === 'status' && item.onPress);

        return (
            <TouchableOpacity
                key={item.label}
                style={[
                    styles.settingItem,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    !isActionable && styles.settingItemDisabled,
                ]}
                onPress={item.onPress}
                disabled={!isActionable && item.type !== 'toggle'}
                activeOpacity={isActionable || item.type === 'toggle' ? 0.7 : 1}
            >
                <View style={styles.settingLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                        <Ionicons name={item.icon} size={24} color={theme.primary} />
                    </View>
                    <View style={styles.settingTextContainer}>
                        <Text style={[styles.settingLabel, { color: theme.text }]}>
                            {item.label}
                        </Text>
                        {item.type === 'info' && (
                            <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                                {item.value}
                            </Text>
                        )}
                        {item.type === 'status' && (
                            <Text
                                style={[
                                    styles.settingValue,
                                    { color: hasPermission ? theme.success : theme.error }
                                ]}
                            >
                                {item.value}
                            </Text>
                        )}
                        {item.type === 'action' && item.value && (
                            <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                                {item.value}
                            </Text>
                        )}
                    </View>
                </View>

                {item.type === 'toggle' && (
                    <Switch
                        value={item.value}
                        onValueChange={item.onPress}
                        trackColor={{ false: theme.border, true: theme.primary }}
                        thumbColor={theme.surface}
                    />
                )}
                {item.type === 'action' && (
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                )}
            </TouchableOpacity>
        );
    };

    const renderLanguageMenu = () => (
        <Modal
            visible={showLanguageMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowLanguageMenu(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowLanguageMenu(false)}
            >
                <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.menuTitle, { color: theme.text }]}>{t('selectLanguage')}</Text>
                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.menuItem,
                                language === lang.code && { backgroundColor: theme.primary + '20' }
                            ]}
                            onPress={() => {
                                changeLanguage(lang.code);
                                setShowLanguageMenu(false);
                            }}
                        >
                            <Text
                                style={[
                                    styles.menuItemText,
                                    { color: language === lang.code ? theme.primary : theme.text }
                                ]}
                            >
                                {lang.label}
                            </Text>
                            {language === lang.code && (
                                <Ionicons name="checkmark" size={20} color={theme.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[styles.menuItem, { marginTop: SPACING.sm }]}
                        onPress={() => setShowLanguageMenu(false)}
                    >
                        <Ionicons name="close" size={20} color={theme.error} />
                        <Text style={[styles.menuItemText, { color: theme.error }]}>{t('cancel')}</Text>
                    </TouchableOpacity>
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
                    paddingTop: insets.top + SPACING.sm
                }
            ]}>
                <Text style={[styles.title, { color: theme.text }]}>{t('settings')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {settingsSections.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                            {section.title}
                        </Text>
                        {section.items.map(renderSettingItem)}
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                        {t('developedBy')}
                    </Text>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                        © 2025 Evxf Sounds
                    </Text>
                </View>
            </ScrollView>
            {renderLanguageMenu()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: FONT_SIZES['2xl'],
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: SPACING.md,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: SPACING.md,
        marginLeft: SPACING.xs,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
    },
    settingItemDisabled: {
        opacity: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: FONT_SIZES.base,
        fontWeight: '600',
        marginBottom: 2,
    },
    settingValue: {
        fontSize: FONT_SIZES.sm,
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
        paddingTop: SPACING.xl,
    },
    footerText: {
        fontSize: FONT_SIZES.sm,
        marginBottom: SPACING.xs,
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
});
