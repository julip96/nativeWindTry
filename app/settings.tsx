import { useSession } from '@/components/SessionProvider'
import { H1, ScrollView, View, Text } from 'dripsy'
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

        <ScrollView sx={{ flex: 1, backgroundColor: '$background', p: 's' }}>
            <Text variant="heading">Settings</Text>

            <Account session={session.session} />


            <Text variant="headingTwo">Colour mode</Text>



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
                    color={mode === 'standard' ? '$primary' : '$secondary'}
                />


                <Button
                    title="Pink"
                    onPress={() => setMode('pink')}
                    color={mode === 'pink' ? '$primary' : '$secondary'}
                />

            </View>

            {/* ---------- Logout Card ---------- */}
            <Button
                title="Logout"
                onPress={confirmLogout}
                color='$accent'
            />


            <StatusBar style="auto" />
        </ScrollView>
    )
}
