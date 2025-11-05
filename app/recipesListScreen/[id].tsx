import React, { use } from 'react'
import { View, Text, ScrollView } from 'dripsy'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RecipeDetailsScreen() {

    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [recipe, setRecipe] = React.useState<any | null>(null);

    React.useEffect(() => {

        const loadRecipe = async () => {

            try {

                const data = await AsyncStorage.getItem(`recipe-${id}`);

                if (data) {

                    setRecipe(JSON.parse(data));

                } else {

                    setRecipe(null);

                }

            } catch (e) {

                console.error('Error loading recipe:', e);

            }

        }

        loadRecipe();

    }, [id]);

    if (!recipe) return <Text>Recipe not found</Text>

    const deleteRecipe = async () => {

        await AsyncStorage.removeItem(`recipe-${id}`);
        router.back();

    }

    return (

        <ScrollView>

            <View sx={{ flex: 1, bg: '$background', p: 'm' }}>

                <Text variant="heading" sx={{ mb: 'm' }}>

                    {recipe.title}

                </Text>

                <Text variant="heading" sx={{ mb: 'm' }}>

                    Ingredients:

                </Text>

                <Text variant="body">{recipe.ingredients}</Text>

                <Text variant="heading" sx={{ mb: 'm' }}>

                    Instructions:

                </Text>

                <Text variant="body">{recipe.instructions}</Text>

            </View>

            {/* Delete Recipe */}
            <Pressable

                onPress={deleteRecipe}

                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>

                <View sx={{

                    bg: '$primary',
                    p: 'm',
                    borderRadius: 'm',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 's',

                }}>
                    <Text sx={{ color: 'white', fontWeight: 'bold' }}>Delete</Text>

                </View>

            </Pressable>


            <StatusBar style="dark" />


        </ScrollView>
    )
}
