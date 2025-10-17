import { Stack } from 'expo-router'

export default function RecipesTabLayout() {
    return (

        <Stack>
            <Stack.Screen name="index" />  {/* Recipes list */}
            <Stack.Screen name="[id]" />   {/* Recipe details */}
        </Stack>

    )
}
