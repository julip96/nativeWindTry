import React from 'react'
import { View, Text, H1, ScrollView } from 'dripsy'
import { Switch } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useThemeMode } from '../components/ThemeProvider'
import { SafeAreaView } from 'react-native-safe-area-context'
import Account from '../components/account'
import { useSession } from '@/components/SessionProvider'

export default function SettingsScreen() {

    const session = useSession()

    const { mode, setMode } = useThemeMode()

    const isStandard = mode === 'standard'
    const isPink = mode === 'pink'

    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: '#fffaf0' }}>

            <ScrollView>

                <View
                    sx={{
                        backgroundColor: '$background',
                        padding: 20,
                        margin: 5,
                        flex: 1,
                        marginTop: 25,
                        marginBottom: 50,
                        borderRadius: 5,
                    }}
                >
                    <H1 sx={{ color: '$text', fontSize: 20, marginTop: 20 }}>Settings</H1>

                    <Text sx={{ color: '$text', fontSize: 20, marginTop: 20 }}>Color Mode</Text>

                    <View sx={{ flexDirection: 'row', alignItems: 'center', mt: 'm' }}>
                        <Text sx={{ color: '$text', mr: 'm' }}>Standard</Text>
                        <Switch
                            value={isStandard}
                            onValueChange={() => setMode('standard')}
                        />
                    </View>

                    <View sx={{ flexDirection: 'row', alignItems: 'center', mt: 's' }}>
                        <Text sx={{ color: '$text', mr: 'm' }}>Pink</Text>
                        <Switch
                            value={isPink}
                            onValueChange={() => setMode('pink')}
                        />
                    </View>

                    <Account session={session.session} />

                    <StatusBar style="dark" />
                </View>
            </ScrollView>
        </SafeAreaView>

    )
}
