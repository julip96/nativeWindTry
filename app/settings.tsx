import React from 'react'
import { View, Text, H1, ScrollView } from 'dripsy'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeMode } from '../components/ThemeProvider'
import { useSession } from '@/components/SessionProvider'

import { ThemeCard } from '../components/ThemeCard'
import { ThemeButton } from '../components/ThemeButton'
import Account from '../components/Account'


export default function SettingsScreen() {
    const session = useSession()
    const { mode, setMode } = useThemeMode()

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView>

                {/* ---------- Profile Card ---------- */}
                <ThemeCard sx={{ margin: 16, alignItems: 'center' }}>
                    <Account session={session.session} />
                </ThemeCard>

                {/* ---------- Theme Card ---------- */}
                <ThemeCard sx={{ margin: 16 }}>
                    <H1 sx={{ fontSize: 22, marginBottom: 16, color: '$text' }}>
                        Color Mode
                    </H1>

                    {/* Segmented Control */}
                    <View
                        sx={{
                            flexDirection: 'row',
                            backgroundColor: '$mutedBackground',
                            borderRadius: 12,
                            padding: 4,
                        }}
                    >
                        <ThemeButton
                            title="standard"
                            onPress={() => setMode('standard')}
                            sx={{
                                flex: 1,
                                paddingY: 10,
                                borderRadius: 10,
                                alignItems: 'center',
                                backgroundColor:
                                    mode === 'standard' ? '$primary' : 'transparent',
                                color: mode === 'standard' ? 'white' : 'black',
                            }}
                        >
                            <Text sx={{ color: mode === 'standard' ? 'white' : '$text' }}>
                                Standard
                            </Text>
                        </ThemeButton>

                        <ThemeButton
                            title="Pink"
                            onPress={() => setMode('pink')}
                            sx={{
                                flex: 1,
                                paddingY: 10,
                                borderRadius: 10,
                                alignItems: 'center',
                                backgroundColor:
                                    mode === 'pink' ? '$primary' : 'transparent',
                            }}
                        >
                            <Text sx={{ color: mode === 'pink' ? 'white' : '$text' }}>
                                Pink
                            </Text>
                        </ThemeButton>
                    </View>
                </ThemeCard>



                <StatusBar style="dark" />
            </ScrollView>
        </SafeAreaView>
    )
}
