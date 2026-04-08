// app/recipesListScreen/_layout.tsx
import { Stack } from 'expo-router'

export default function SettingsTabLayout() {
    return (
        <Stack
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Settings',

                }}
            />
            <Stack.Screen
                name="manageAccount"
                options={{
                    title: 'ManageAccount',
                    // presentation: 'modal',
                }}
            />


        </Stack>
    )
}
