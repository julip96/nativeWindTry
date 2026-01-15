import React from 'react'
import { Animated, Platform, Pressable } from 'react-native'
import { View, Text, ScrollView, TextInput } from 'dripsy'
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../utils/supabase'
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { SearchHeader } from '../../components/SearchHeader'



export default function RecipesListScreen() {

    const router = useRouter()
    const { book_id } = useLocalSearchParams()
    const [recipes, setRecipes] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSearching, setIsSearching] = React.useState(false);

    const searchAnim = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.timing(searchAnim, {
            toValue: isSearching ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [isSearching]);

    useFocusEffect(

        React.useCallback(() => {

            loadRecipes()

        }, [book_id])

    )


    async function loadRecipes() {
        try {
            setLoading(true)

            let query = supabase
                .from('recipes')
                .select('*')
                .order('created_at', { ascending: false });

            // Wenn book_id existiert, filtere nach diesem Buch
            if (book_id) {
                query = query.eq('book_id', book_id)
            }

            const { data, error } = await query

            if (error) throw error
            setRecipes(data || [])

        } catch (e) {
            console.error('Error loading recipes:', e)
        } finally {
            setLoading(false)
        }
    }

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
    );


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
                <SearchHeader
                    title="Recipes"
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isSearching={isSearching}
                    setIsSearching={setIsSearching}
                    searchPlaceholder="Search recipes..."
                    rightAction={
                        <Pressable
                            onPress={() =>
                                router.push(`/recipes/newRecipe${book_id ? `?book_id=${book_id}` : ''}`)
                            }
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
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                    + New
                                </Text>
                            </View>
                        </Pressable>
                    }
                />



                {/* Recipe cards */}
                {loading ? (
                    <Text>Loading recipes...</Text>
                ) : filteredRecipes.length === 0 ? (
                    <Text>

                        {book_id ? 'No recipes found in this book.' : 'No recipes found.'}

                    </Text>
                ) : (
                    filteredRecipes.map((recipe) => (

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
                                onPress={() => router.push(`/recipes/${recipe.id}`)}
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
