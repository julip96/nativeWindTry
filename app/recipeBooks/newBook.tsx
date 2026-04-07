import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'dripsy';
import { Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';

import Button from '@/components/Button';
import UserInput from '@/components/UserInput';

export default function NewRecipeBookScreen() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error);
                return;
            }
            setUserId(data?.user?.id ?? null);
        };
        loadUser();
    }, []);

    const handleSave = async () => {
        if (!userId) {
            Alert.alert('Wait', 'User not loaded yet.');
            return;
        }
        if (!name.trim()) {
            Alert.alert('Validation', 'Please enter a book name.');
            return;
        }

        const { error } = await supabase.from('recipe_books').insert([{ owner_id: userId, name, description }]);
        if (error) {
            console.error('Error creating book:', error);
            Alert.alert('Error', 'Could not create book.');
            return;
        }

        router.push('/recipeBooks');
    };

    return (
        <ScrollView sx={{ flex: 1, bg: '$background', p: 'm' }}>
            <Text variant="heading">New Recipe Book</Text>



            <UserInput
                label="Book Title"
                value={name}
                onChangeText={setName}
                placeholder="Enter book title"
            />

            <UserInput
                label="Description (optional)"
                value={description}
                onChangeText={setDescription}
                placeholder="Enter book description"
            />

            <Button
                title="Save Book"
                onPress={handleSave}
                color='$primary'
            />

        </ScrollView>
    );
}
