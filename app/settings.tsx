import React from 'react'
import { View, Text, H1, ScrollView, Pressable } from 'dripsy'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeMode } from '../components/ThemeProvider'
import { useSession } from '@/components/SessionProvider'
import Account from '../components/Account'

export default function SettingsScreen() {
    const session = useSession()
    const { mode, setMode } = useThemeMode()

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView>

                {/* ---------- Profile Card ---------- */}
                <View
                    sx={{
                        backgroundColor: '$background',
                        borderRadius: 20,
                        padding: 24,
                        margin: 16,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                    }}
                >
                    <Account session={session.session} mode="header" />

                </View>

                {/* ---------- Theme Card ---------- */}
                <View
                    sx={{
                        backgroundColor: '$background',
                        borderRadius: 20,
                        padding: 24,
                        marginHorizontal: 16,
                        marginTop: 8,
                        shadowColor: '#000',
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                    }}
                >
                    <H1 sx={{ fontSize: 22, marginBottom: 16, color: '$text' }}>Color Mode</H1>

                    {/* Segmented Control */}
                    <View
                        sx={{
                            flexDirection: 'row',
                            backgroundColor: '$mutedBackground',
                            borderRadius: 12,
                            padding: 4,
                        }}
                    >
                        <Pressable
                            onPress={() => setMode('standard')}
                            sx={{
                                flex: 1,
                                paddingY: 10,
                                borderRadius: 10,
                                alignItems: 'center',
                                backgroundColor: mode === 'standard' ? '$primary' : 'transparent',
                            }}
                        >
                            <Text sx={{ color: mode === 'standard' ? 'white' : '$text' }}>
                                Standard
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setMode('pink')}
                            sx={{
                                flex: 1,
                                paddingY: 10,
                                borderRadius: 10,
                                alignItems: 'center',
                                backgroundColor: mode === 'pink' ? '$primary' : 'transparent',
                            }}
                        >
                            <Text sx={{ color: mode === 'pink' ? 'white' : '$text' }}>
                                Pink
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* ---------- Status Bar ---------- */}
                <StatusBar style="dark" />
            </ScrollView>
        </SafeAreaView>
    )
}
