import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'dripsy';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';

export default function RecipeBooksScreen() {
    const router = useRouter();
    const [books, setBooks] = useState<any[]>([]);

    useEffect(() => {
        const loadBooks = async () => {
            // RLS will already limit to the books the current user owns or is collaborator on
            const { data, error } = await supabase.from('recipe_books').select('*').order('created_at', { ascending: false });
            if (error) {
                console.error('Error loading books:', error);
                return;
            }
            setBooks(data || []);
        };

        loadBooks();

        // optional: subscribe to realtime changes on recipe_books if you want auto refresh
    }, []);

    return (
        <ScrollView sx={{ flex: 1, bg: '$background', p: 'm' }}>
            <View sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 'm' }}>
                <Text variant="heading">Recipe Books</Text>

                <Pressable
                    android_ripple={{ color: '#ccc' }}
                    onPress={() => router.push('/recipeBooks/newBook')}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                    <View sx={{ bg: '$primary', px: 'm', py: 's', borderRadius: 'm', alignItems: 'center', justifyContent: 'center' }}>
                        <Text sx={{ color: 'white', fontWeight: 'bold' }}>+ New Book</Text>
                    </View>
                </Pressable>
            </View>

            {books.length === 0 ? (
                <Text>No recipe books yet.</Text>
            ) : (
                books.map((book) => (
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
            )}
        </ScrollView>
    );
}
