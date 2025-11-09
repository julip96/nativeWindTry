import React, { use } from 'react'
import { View, Text, ScrollView } from 'dripsy'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/utils/supabase';

export default function RecipeDetailsScreen() {

    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [recipe, setRecipe] = React.useState<any | null>(null);

    React.useEffect(() => {

        const loadRecipe = async () => {

            if (!id) return

            try {

                const { data, error }
                    = await supabase
                        .from('recipes')
                        .select('*')
                        .eq('id', id)
                        .single()

                if (error) throw error

                setRecipe(data)

            } catch (e) {

                console.error('Error loading recipe: ', e)
                Alert.alert('Error', 'Could not load recipe.')

            }
        }

        loadRecipe()
    }, [id])

    if (!recipe) return <Text>Recipe not found</Text>

    const deleteRecipe = async () => {

        try {

            await supabase.from('recipes').delete().eq('id', id)
            router.back()

        } catch (e) {

            console.error('Error deleting recipe')
            Alert.alert('Error', 'Could not delete recipe')

        }

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
