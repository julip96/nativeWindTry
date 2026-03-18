import { useSession } from '@/components/SessionProvider'
import { H1, ScrollView, View } from 'dripsy'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useThemeMode } from '../components/ThemeProvider'

import Button from '@/components/Button'
import { Alert } from 'react-native'
import Account from '../components/Account'
import { supabase } from '../utils/supabase'

export default function SettingsScreen() {
    const session = useSession()
    const { mode, setMode } = useThemeMode()

    async function handleLogout() {
        const { error } = await supabase.auth.signOut()

        if (error) {
            Alert.alert('Logout failed', error.message)
        }
    }

    function confirmLogout() {
        Alert.alert(
            'Sign out',
            'Do you really want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: handleLogout },
            ]
        )
    }

    return (

        <ScrollView style={{ flex: 1, backgroundColor: '$background' }}>

            {/* ---------- Profile Card ---------- */}
            <Account session={session.session} />

            {/* ---------- Theme Card ---------- */}
            <H1 sx={{ fontSize: 22, marginBottom: 16, color: '$text' }}>
                Color Mode
            </H1>



            {/* Segmented Control */}
            <View
                sx={{
                    flexDirection: 'row',
                    backgroundColor: '$background',
                    borderRadius: 12,
                    padding: 4,
                }}
            >
                <Button
                    title="standard"
                    onPress={() => setMode('standard')}
                    sx={{

                        backgroundColor:
                            mode === 'standard' ? '$primary' : 'transparent',
                        color: mode === 'standard' ? 'white' : 'black',
                    }}
                />


                <Button
                    title="Pink"
                    onPress={() => setMode('pink')}
                    sx={{

                        backgroundColor:
                            mode === 'pink' ? '$primary' : 'transparent',
                    }} />

            </View>

            {/* ---------- Logout Card ---------- */}
            <Button
                title="Logout"
                onPress={confirmLogout}
                color='accent'
            />


            <StatusBar style="auto" />
        </ScrollView>
    )
}
