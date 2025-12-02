import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { HomeScreen } from '../screens/HomeScreen';
import { PlaylistsScreen } from '../screens/PlaylistsScreen';
import { PlaylistDetailScreen } from '../screens/PlaylistDetailScreen';
import { TopPlayedScreen } from '../screens/TopPlayedScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { MiniPlayer } from '../components/MiniPlayer';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const HomeTabs = ({ navigation }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();

    return (
        <>
            <Tab.Navigator
                tabBarPosition="bottom"
                screenOptions={({ route }) => ({
                    swipeEnabled: true,
                    tabBarActiveTintColor: theme.primary,
                    tabBarInactiveTintColor: theme.textSecondary,
                    tabBarStyle: {
                        backgroundColor: theme.surface,
                        borderTopWidth: 1,
                        borderTopColor: theme.border,
                        paddingBottom: insets.bottom,
                        height: 60 + insets.bottom,
                        elevation: 8,
                    },
                    tabBarIndicatorStyle: {
                        backgroundColor: theme.primary,
                        height: 3,
                        top: 0,
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        textTransform: 'capitalize',
                        fontWeight: '600',
                    },
                    tabBarShowIcon: true,
                    tabBarIcon: ({ focused, color }) => {
                        let iconName;
                        if (route.name === 'Home') {
                            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
                        } else if (route.name === 'Playlists') {
                            iconName = focused ? 'list' : 'list-outline';
                        } else if (route.name === 'TopPlayed') {
                            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings' : 'settings-outline';
                        }
                        return <Ionicons name={iconName} size={24} color={color} />;
                    },
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ tabBarLabel: t('myMusic') }}
                />
                <Tab.Screen
                    name="Playlists"
                    component={PlaylistsScreen}
                    options={{ tabBarLabel: t('playlists') }}
                />
                <Tab.Screen
                    name="TopPlayed"
                    component={TopPlayedScreen}
                    options={{ tabBarLabel: t('topPlayed') }}
                />
                <Tab.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{ tabBarLabel: t('settings') }}
                />
            </Tab.Navigator>
            <MiniPlayer onPress={() => navigation.navigate('Player')} />
        </>
    );
};

export const AppNavigator = () => {
    const { theme, isDarkMode } = useTheme();
    const navigationRef = useRef();

    const navigationTheme = {
        ...(isDarkMode ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
            primary: theme.primary,
            background: theme.background,
            card: theme.surface,
            text: theme.text,
            border: theme.border,
            notification: theme.primary,
        },
    };

    return (
        <NavigationContainer theme={navigationTheme} ref={navigationRef}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    presentation: 'modal',
                    cardStyle: { backgroundColor: theme.background },
                }}
            >
                <Stack.Screen name="Main" component={HomeTabs} />
                <Stack.Screen
                    name="Player"
                    component={PlayerScreen}
                    options={{
                        presentation: 'modal',
                        cardStyle: { backgroundColor: theme.background },
                    }}
                />
                <Stack.Screen
                    name="PlaylistDetail"
                    component={PlaylistDetailScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
