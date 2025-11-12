import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'dripsy';
import { Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons'

export default function RecipeBooksScreen() {

    const router = useRouter();
    const [books, setBooks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Animation values searchbar
    const fadeAnim = React.useRef(new Animated.Value(1)).current;
    const slideAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loadBooks = async () => {
            // RLS will already limit to the books the current user owns or is collaborator on
            const { data, error } = await supabase
                .from('recipe_books')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {

                console.error('Error loading books:', error);
                return;

            }

            setBooks(data || []);

        };

        loadBooks();

        // optional: subscribe to realtime changes on recipe_books if you want auto refresh
    }, []);

    const filteredBooks = books.filter(book =>

        book.name.toLowerCase().includes(searchQuery.toLowerCase())

    );

    // ✅ Animate when toggling search
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: isSearching ? 1 : 0.5,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: isSearching ? 0 : -20,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isSearching]);

    return (

        <ScrollView sx={{ flex: 1, bg: '$background', p: 'm' }}>

            <Animated.View

                style={{

                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]

                }}

            >
                {!isSearching ? (

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flex: 1,
                        }}
                    >
                        <Text variant="heading">Recipe Books</Text>

                        <View sx={{ flexDirection: 'row', gap: 10 }}>

                            {/* Search Icon */}
                            <Pressable
                                onPress={() => setIsSearching(true)}
                                android_ripple={{ color: '#ccc' }}
                                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                            >

                                <Ionicons name="search" size={24} color="black" />

                            </Pressable>

                            {/* New Book Button */}
                            <Pressable

                                android_ripple={{ color: '#ccc' }}
                                onPress={() => router.push('/recipeBooks/newBook')}
                                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}

                            >
                                <View

                                    sx={{
                                        bg: '$primary',
                                        px: 'm',
                                        py: 's',
                                        borderRadius: 'm',
                                        alignItems: 'center',
                                        justifyContent: 'center'

                                    }}

                                >

                                    <Text sx={{ color: 'white', fontWeight: 'bold' }}>+ New Book</Text>

                                </View>

                            </Pressable>

                        </View>

                    </View>

                ) : (
                    // Search Bar
                    <View
                        style={{

                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1

                        }}
                    >

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

            </Animated.View >




            {/* Book list */}
            {
                filteredBooks.length === 0 ? (
                    <Text>No recipe books found.</Text>
                ) : (
                    filteredBooks.map((book) => (
                        <Pressable
                            key={book.id}
                            android_ripple={{ color: '#ddd' }}
                            onPress={() =>
                                router.push(`/recipesListScreen?book_id=${book.id}`)
                            }
                        >
                            <View sx={{ bg: '$muted', p: 'm', mb: 's', borderRadius: 'm' }}>
                                <Text variant="heading">{book.name}</Text>
                                <Text variant="small">Created: {new Date(book.created_at).toLocaleDateString()}</Text>
                            </View>
                        </Pressable>
                    ))
                )
            }
        </ScrollView >
    );
}
