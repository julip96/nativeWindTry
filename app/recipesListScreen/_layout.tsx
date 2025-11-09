// app/recipesListScreen/_layout.tsx
import { Stack } from 'expo-router'

export default function RecipesTabLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Recipes',
                }}
            />
            <Stack.Screen
                name="newRecipe"
                options={{
                    title: 'New Recipe',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: 'Recipe Details',
                }}
            />
        </Stack>
    )
}
