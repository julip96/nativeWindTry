import React from 'react'
import { Platform, Pressable } from 'react-native'
import { View, Text } from 'dripsy'
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '../../utils/supabase'
import PagerView from 'react-native-pager-view'
import BookPage from '@/components/BookPage'
import { Image } from 'react-native'
import PageCurl from '@/components/PageCurl'

export default function RecipesListScreen() {
    const router = useRouter()
    const { book_id } = useLocalSearchParams()

    const [recipes, setRecipes] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)
    const [currentPage, setCurrentPage] = React.useState(0)

    useFocusEffect(
        React.useCallback(() => { loadRecipes() }, [book_id])
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

    // Total pages = TOC + all recipes
    const totalPages = 1 + recipes.length

    function goNext() {
        if (currentPage < totalPages - 1) {
            pagerRef.current?.setPage(currentPage + 1)
        }
    }

    function goPrev() {
        if (currentPage > 0) {
            pagerRef.current?.setPage(currentPage - 1)
        }
    }

    const pagerRef = React.useRef<PagerView>(null)

    return (
        // This might cause saveareview to not work properly
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fffaf0' }} edges={['bottom']}>

            <StatusBar style="dark" />

            {loading ? (
                <Text>Loading…</Text>
            ) : (
                <PagerView
                    style={{ flex: 1 }}
                    initialPage={0}
                    onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
                    ref={pagerRef}
                >
                    {/* ---------------------------------- */}
                    {/* PAGE 0 — TABLE OF CONTENTS         */}
                    {/* ---------------------------------- */}
                    <View key="toc">
                        <BookPage pageIndex={0}>
                            <Text
                                sx={{
                                    fontSize: 26,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    mb: 'l',
                                    mt: 'm',
                                }}
                            >
                                Contents
                            </Text>

                            <View sx={{ mt: 'm' }}>
                                {recipes.map((r, i) => (
                                    <Pressable
                                        key={r.id}
                                        onPress={() => pagerRef.current?.setPage(i + 1)}
                                        style={({ pressed }) => ({
                                            opacity: pressed ? 0.6 : 1,
                                            paddingVertical: 8,
                                        })}
                                    >
                                        <View
                                            sx={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                borderBottomWidth: 1,
                                                borderColor: '#e0d8c3',
                                                paddingVertical: 6,
                                            }}
                                        >
                                            <Text
                                                sx={{
                                                    fontSize: 18,
                                                    color: '#3b2f2f',
                                                }}
                                            >
                                                {r.title}
                                            </Text>

                                            {/* Fake page numbers like a real book */}
                                            <Text
                                                sx={{
                                                    fontSize: 18,
                                                    color: '#3b2f2f',
                                                }}
                                            >
                                                {i + 1}
                                            </Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </BookPage>
                    </View>

                    {/* ---------------------------------- */}
                    {/* RECIPE PAGES                        */}
                    {/* ---------------------------------- */}
                    {recipes.map((recipe, index) => (
                        <View key={`recipe-${recipe.id}`}>

                            <PageCurl
                                onNext={() => pagerRef.current?.setPage(currentPage + 1)}
                                onPrev={() => pagerRef.current?.setPage(currentPage - 1)}
                            >

                                <BookPage pageIndex={index + 1}>

                                    {/* EDIT BUTTON */}
                                    <Pressable
                                        onPress={() => router.push(`./editRecipe?id=${recipe.id}`)}
                                        style={{
                                            position: "absolute",
                                            top: 10,
                                            right: 10,
                                            backgroundColor: "#ffb84d",
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            borderRadius: 8,
                                            zIndex: 99,
                                        }}
                                    >
                                        <Text style={{ fontWeight: "bold", color: "#4a2f00" }}>Edit</Text>
                                    </Pressable>

                                    <Text variant="heading">{recipe.title}</Text>


                                    {recipe.image_url ? (
                                        <Image
                                            source={{ uri: recipe.image_url }}
                                            style={{
                                                width: '100%',
                                                height: 160,
                                                borderRadius: 10,
                                                marginVertical: 10,
                                            }}
                                            resizeMode="cover"
                                        />
                                    ) : null}

                                    <Text sx={{ mt: 'm' }}>
                                        {recipe.description || 'No description'}
                                    </Text>



                                </BookPage>

                            </PageCurl>

                        </View>
                    ))}
                </PagerView>
            )}

            {/* Navigation Buttons */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 20,
                }}
            >
                {/* Previous (hidden on TOC) */}
                {currentPage > 0 ? (
                    <Pressable
                        onPress={() => pagerRef.current?.setPage(currentPage - 1)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                        <View
                            style={{
                                backgroundColor: '#ccc',
                                padding: 10,
                                borderRadius: 10,
                            }}
                        >
                            <Text>Previous</Text>
                        </View>
                    </Pressable>
                ) : (
                    <View />
                )}

                {/* Back to Contents (only on recipe pages) */}
                {currentPage > 0 && (
                    <Pressable
                        onPress={() => pagerRef.current?.setPage(0)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                        <View
                            style={{
                                backgroundColor: '#ffda79',
                                padding: 10,
                                borderRadius: 10,
                            }}
                        >
                            <Text>Back to Contents</Text>
                        </View>
                    </Pressable>
                )}

                {/* Next (hidden on last recipe page) */}
                {currentPage < recipes.length ? (
                    <Pressable
                        onPress={() => pagerRef.current?.setPage(currentPage + 1)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                        <View
                            style={{
                                backgroundColor: '#ccc',
                                padding: 10,
                                borderRadius: 10,
                            }}
                        >
                            <Text>Next</Text>
                        </View>
                    </Pressable>
                ) : (
                    <View />
                )}
            </View>

        </SafeAreaView>
    )
}
