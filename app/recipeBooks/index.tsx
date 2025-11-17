// app/recipeBooks/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'dripsy';
import { Pressable, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function RecipeBooksScreen() {
    const router = useRouter();
    const [books, setBooks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Responsive columns: dynamic based on width
    const screenWidth = Dimensions.get('window').width;
    const columns = screenWidth >= 700 ? 3 : 2; // phone = 2, tablet = 3
    const horizontalPadding = 32;
    const gutter = 16;
    const bookWidth = (screenWidth - horizontalPadding - gutter * (columns - 1)) / columns;

    // Small header animations
    const fadeAnim = React.useRef(new Animated.Value(1)).current;
    const slideAnim = React.useRef(new Animated.Value(0)).current;

    // Load books every time screen is focused (fix for new books not appearing)
    useFocusEffect(
        React.useCallback(() => {
            const loadBooks = async () => {
                const { data, error } = await supabase
                    .from('recipe_books')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error) {
                    setBooks(data || []);
                }
            };

            loadBooks();
        }, [])
    );

    function BookItem({ book, bookWidth, onPress, colors }) {
        const scale = React.useRef(new Animated.Value(1)).current;
        const rotate = React.useRef(new Animated.Value(0)).current;
        const flash = React.useRef(new Animated.Value(0)).current;

        const startAnimation = () => {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(scale, {
                        toValue: 1.12,
                        duration: 270,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotate, {
                        toValue: 1,
                        duration: 270,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(flash, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                flash.setValue(0);
                rotate.setValue(0);
                scale.setValue(1);
                onPress();
            });
        };

        const animatedStyle = {
            transform: [
                { scale },
                {
                    rotateY: rotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '-35deg'],
                    }),
                },
            ],
            opacity: flash.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.4],
            }),
        };

        return (
            <Pressable onPress={startAnimation} style={{ width: bookWidth }}>
                <Animated.View
                    style={[
                        {
                            borderRadius: 10,
                            overflow: 'hidden',
                        },
                        animatedStyle,
                    ]}
                >
                    <View
                        style={{
                            backgroundColor: colors.bg,
                            borderRadius: 10,
                            padding: 12,
                            height: 160,
                            justifyContent: 'space-between',
                            shadowColor: '#000',
                            shadowOpacity: 0.22,
                            shadowOffset: { width: 0, height: 6 },
                            shadowRadius: 10,
                            elevation: 6,
                        }}
                    >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text
                                numberOfLines={3}
                                style={{
                                    color: '#fffbe8',
                                    fontWeight: '800',
                                    fontSize: 16,
                                    lineHeight: 20,
                                }}
                            >
                                {book.name}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View
                                style={{
                                    height: 8,
                                    backgroundColor: colors.stripe,
                                    width: '40%',
                                    borderRadius: 4,
                                }}
                            />
                            <Text style={{ color: '#f6e7c6', fontSize: 12 }}>
                                {new Date(book.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        );
    }


    // Magical slow book-open animation
    function useBookOpenAnimation(onFinish: () => void) {
        const scale = React.useRef(new Animated.Value(1)).current;
        const rotate = React.useRef(new Animated.Value(0)).current;
        const flash = React.useRef(new Animated.Value(0)).current;

        const start = () => {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(scale, {
                        toValue: 1.12,
                        duration: 270,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotate, {
                        toValue: 1,
                        duration: 270,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(flash, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                flash.setValue(0);
                rotate.setValue(0);
                scale.setValue(1);
                onFinish();
            });
        };

        return {
            start,
            animatedStyle: {
                transform: [
                    { scale },
                    {
                        rotateY: rotate.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '-35deg'], // slower & more magical
                        }),
                    },
                ],
                opacity: flash.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.4],
                }),
            },
        };
    }

    // Header animation triggers
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: isSearching ? 1 : 0.9,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: isSearching ? 0 : -10,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isSearching]);

    const filteredBooks = books.filter((book) =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Generates warm leather tones per-book
    function leatherColorFromId(id: number | string) {
        const seed = String(id)
            .split('')
            .reduce((acc, c) => acc + c.charCodeAt(0), 0);

        const palette = [
            { bg: '#5A371A', stripe: '#D4B26A' },
            { bg: '#6A3F20', stripe: '#E0C57D' },
            { bg: '#4B2E1A', stripe: '#C8A85C' },
            { bg: '#7A4522', stripe: '#F0D49A' },
            { bg: '#8A5130', stripe: '#E6C07A' },
        ];

        return palette[seed % palette.length];
    }

    return (
        <ScrollView sx={{ flex: 1, bg: '$background', p: 'm' }}>

            {/* HEADER */}
            <Animated.View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }}
            >
                {!isSearching ? (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                        <Text variant="heading">Recipe Books</Text>

                        <View sx={{ flexDirection: 'row', gap: 10 }}>
                            <Pressable
                                onPress={() => setIsSearching(true)}
                                android_ripple={{ color: '#ccc' }}
                                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                            >
                                <Ionicons name="search" size={24} color="black" />
                            </Pressable>

                            <Pressable
                                onPress={() => router.push('/recipeBooks/newBook')}
                                android_ripple={{ color: '#ccc' }}
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
                                    <Text sx={{ color: 'white', fontWeight: 'bold' }}>+ New Book</Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search books..."
                            sx={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: '$border',
                                borderRadius: 'm',
                                p: 's',
                                bg: '$muted',
                            }}
                        />
                        <Pressable
                            onPress={() => {
                                setIsSearching(false);
                                setSearchQuery('');
                            }}
                            style={({ pressed }) => [{ marginLeft: 10, opacity: pressed ? 0.6 : 1 }]}
                        >
                            <Ionicons name="close" size={24} color="black" />
                        </Pressable>
                    </View>
                )}
            </Animated.View>

            {/* BOOKSHELF GRID */}
            <View style={{ flexDirection: 'column' }}>
                {Array.from({ length: Math.ceil(filteredBooks.length / columns) }).map((_, rowIdx) => {
                    const rowBooks = filteredBooks.slice(
                        rowIdx * columns,
                        rowIdx * columns + columns
                    );

                    return (
                        <View key={rowIdx}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 16,
                                }}
                            >
                                {rowBooks.map((book) => {
                                    const colors = leatherColorFromId(book.id);
                                    return (
                                        <BookItem
                                            key={book.id}
                                            book={book}
                                            bookWidth={bookWidth}
                                            colors={colors}
                                            onPress={() =>
                                                router.push(`/recipesListScreen?book_id=${book.id}`)
                                            }
                                        />
                                    );
                                })}

                            </View>

                            {/* Shelf after each row */}
                            <View
                                style={{
                                    height: 20,
                                    marginBottom: 22,
                                    backgroundColor: '#6b4a2b',
                                    borderRadius: 6,
                                    shadowColor: '#000',
                                    shadowOpacity: 0.1,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                            />
                        </View>
                    );
                })}
            </View>

            {filteredBooks.length === 0 && (
                <View sx={{ mt: 'm', alignItems: 'center' }}>
                    <Text>No recipe books found.</Text>
                </View>
            )}
        </ScrollView>
    );
}
