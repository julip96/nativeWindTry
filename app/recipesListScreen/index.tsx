import React from 'react'
import { Platform, Pressable } from 'react-native'
import { View, Text, ScrollView } from 'dripsy'
import { useRouter, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';

export default function RecipesListScreen() {

    const router = useRouter()
    const [savedRecipes, setSavedRecipes] = React.useState([])

    useFocusEffect(

        React.useCallback(() => {

            loadRecipes()

        }, [])

    )

    async function loadRecipes() {

        try {

            const keys = await AsyncStorage.getAllKeys()

            const recipeKeys = keys.filter((key) => key.startsWith('recipe-'))

            const items = await AsyncStorage.multiGet(recipeKeys)

            const loadedRecipes = items.map(([key, value]) => JSON.parse(value!))

            setSavedRecipes(loadedRecipes)

            console.log('Loaded recipes:', loadedRecipes)

        } catch (e) {

            console.error('Error loading recipes:', e)

        }
    }

    const allRecipes = [...savedRecipes]

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

                    <Text variant="heading">My Recipes</Text>

                    <Pressable

                        android_ripple={{ color: '#ccc' }}
                        onPress={() => router.push('/recipesListScreen/newRecipe')}
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
                {savedRecipes.length === 0 ? (
                    <Text>No recipes found.</Text>
                ) : (
                    savedRecipes.map((recipe) => (

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

                            <Text variant="small" sx={{ mb: 's' }}>

                                {recipe.description}

                            </Text>

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
