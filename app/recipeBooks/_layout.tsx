import { Stack } from 'expo-router';
import React from 'react';

export default function RecipeBooksLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTitleAlign: 'center',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Recipe Books',
                }}
            />
            <Stack.Screen
                name="newBook"
                options={{
                    title: 'New Recipe Book',
                }}
            />
        </Stack>
    );
}
