import React, { use } from 'react'
import { View, Text, ScrollView } from 'dripsy'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/utils/supabase';
import { Image } from 'react-native';

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

        Alert.alert(
            'Delete Recipe',
            'Are you sure you want to delete this recipe?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {


                        try {

                            await supabase.from('recipes').delete().eq('id', id)
                            router.back()

                        } catch (e) {

                            console.error('Error deleting recipe')
                            Alert.alert('Error', 'Could not delete recipe')

                        }


                    }
                }
            ]
        )
    }

    const ingredients =
        typeof recipe.ingredients === 'string'
            ? JSON.parse(recipe.ingredients)
            : recipe.ingredients

    return (

        <ScrollView>

            <View sx={{ flex: 1, bg: '$background', p: 'm' }}>

                <Text variant="heading" sx={{ mb: 'm' }}>

                    {recipe.title}

                </Text>

                {recipe.image_url ? (
                    <Image
                        source={{ uri: recipe.image_url }}
                        style={{
                            width: '100%',
                            height: 200,
                            borderRadius: 12,
                            marginBottom: 16,
                        }}
                        resizeMode="cover"
                    />
                ) : null}



                <Text variant="heading" sx={{ mb: 'm' }}>

                    Ingredients:

                </Text>

                {ingredients && ingredients.length > 0 ? (
                    ingredients.map((item: any, index: number) => (
                        <View
                            key={index}
                            sx={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                bg: '$muted',
                                p: 's',
                                mb: 'xs',
                                borderRadius: 'm',
                            }}
                        >
                            {/* Amount */}
                            <Text sx={{ width: 60, textAlign: 'left', fontWeight: 'bold' }}>
                                {item.quantity ?? item.amount ?? '-'}
                            </Text>

                            {/* Unit */}
                            <Text sx={{ width: 60, textAlign: 'center' }}>
                                {item.unit ?? ''}
                            </Text>

                            {/* Name */}
                            <Text sx={{ flex: 1, textAlign: 'left' }}>
                                {item.name ?? ''}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text variant="body">No ingredients found.</Text>
                )}


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

            <Pressable
                onPress={() => router.replace(`./editRecipe?id=${id}`)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                <View
                    sx={{
                        bg: '$secondary',
                        p: 'm',
                        borderRadius: 'm',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 's',
                    }}>
                    <Text sx={{ color: 'white', fontWeight: 'bold' }}>Edit</Text>
                </View>
            </Pressable>


            <StatusBar style="dark" />


        </ScrollView>
    )
}
