import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'dripsy';
import { Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons'
import { SearchHeader } from '../../components/SearchHeader';

export default function RecipeBooksScreen() {

    const router = useRouter();
    const [books, setBooks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Animation values searchbar
    const fadeAnim = React.useRef(new Animated.Value(1)).current;
    const slideAnim = React.useRef(new Animated.Value(0)).current;
    const searchAnim = React.useRef(new Animated.Value(0)).current;

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

    useEffect(() => {
        Animated.timing(searchAnim, {
            toValue: isSearching ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [isSearching]);


    return (

        <ScrollView sx={{ flex: 1, bg: '$background', p: 'm' }}>

            <SearchHeader
                title="Recipe Books"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
                searchPlaceholder="Search books..."
                rightAction={
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
                            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                                + New
                            </Text>
                        </View>
                    </Pressable>
                }
            />






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
                                router.push(`/recipes?book_id=${book.id}`)
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
