import React from 'react'
import { Platform, Pressable } from 'react-native'
import { View, Text, ScrollView } from 'dripsy'
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../utils/supabase'
import { Image } from 'react-native';


export default function RecipesListScreen() {

    const router = useRouter()
    const { book_id } = useLocalSearchParams()
    const [recipes, setRecipes] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)

    useFocusEffect(

        React.useCallback(() => {

            loadRecipes()

        }, [book_id])

    )

    async function loadRecipes() {

        if (!book_id) return

        try {

            setLoading(true)

            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .eq('book_id', book_id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setRecipes(data || [])

        } catch (e) {

            console.error('Error loading recipes:', e)

        } finally {

            setLoading(false)

        }
    }

    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: '#fffaf0' }}>

            <ScrollView

                sx={{

                    flex: 1,
                    bg: '$background',
                    p: 'm',
                    paddingTop: Platform.OS === 'android' ? 0 : 0,
                    paddingBottom: Platform.OS === 'android' ? 20 : 0,

                }}>

                {/* Heading and Button in one line */}
                <View

                    sx={{

                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 'm',

                    }}
                >

                    <Text variant="heading">Recipes in this book</Text>

                    <Pressable

                        android_ripple={{ color: '#ccc' }}
                        onPress={() => router.push(`/recipesListScreen/newRecipe?book_id=${book_id}`)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}

                    >
                        <View

                            sx={{

                                bg: '$primary',
                                px: 'm',
                                py: 's',
                                borderRadius: 'm',
                                alignItems: 'center',
                                justifyContent: 'center',

                            }}
                        >

                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>+ New</Text>

                        </View>

                    </Pressable>

                </View>

                {/* Recipe cards */}
                {loading ? (
                    <Text>Loading recipes...</Text>
                ) : recipes.length === 0 ? (
                    <Text>No recipes found in this book.</Text>
                ) : (
                    recipes.map((recipe) => (

                        <View

                            key={recipe.id}

                            sx={{

                                bg: '$muted',
                                p: 'm',
                                mb: 's',
                                borderRadius: 'm',

                            }}
                        >

                            <Text variant="heading">{recipe.title}</Text>

                            {recipe.image_url ? (
                                <Image
                                    source={{ uri: recipe.image_url }}
                                    style={{
                                        width: '100%',
                                        height: 120,
                                        borderRadius: 10,
                                        marginBottom: 8,
                                        marginTop: 4,
                                    }}
                                    resizeMode="cover"
                                />
                            ) : null}


                            <Pressable

                                android_ripple={{ color: '#ccc' }}
                                onPress={() => router.push(`/recipesListScreen/${recipe.id}`)}
                                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}

                            >
                                <View
                                    sx={{

                                        bg: '$primary',
                                        p: 'm',
                                        borderRadius: 'm',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mt: 's'

                                    }}
                                >
                                    <Text sx={{ color: 'white', fontWeight: 'bold' }}>View</Text>

                                </View>

                            </Pressable>

                        </View>

                    ))

                )}

            </ScrollView>


            <StatusBar style="dark" />


        </SafeAreaView>
    )
}
