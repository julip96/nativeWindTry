import { Stack } from 'expo-router';
import React from 'react';

export default function RecipeBooksLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Recipe Books',
                    presentation: 'card'
                }}
            />
            <Stack.Screen
                name="newBook"
                options={{
                    title: 'New Recipe Book',
                    // presentation: 'modal',
                }}
            />
        </Stack>
    );
}
