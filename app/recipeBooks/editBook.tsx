import React, { use, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, TextInput } from "react-native";

import { View, Text } from "dripsy";

import Button from "@/components/Button";
import Box from "@/components/Box";
import UserInput from "@/components/UserInput";

import { supabase } from "@/utils/supabase";

export default function EditBookScreen() {

    const { book_id } = useLocalSearchParams();

    const [book, setBook] = useState<any>(null);

    // load book details to edit

    // give input fields for name, description, maybe also a way to change the image

    // save changes to supabase
    console.log("Book ID from params:", book_id);

    useEffect(() => {

        const loadBookDetails = async () => {

            if (!book_id) return;

            const { data, error } = await supabase
                .from('recipe_books')
                .select('*')
                .eq('id', book_id)
                .single();

            if (error) {

                console.error('Error loading book details:', error);
                Alert.alert('Error', 'Could not load book details');
                return;
            }

            console.log("Loaded book data:", data);

            setBook(data);
        };

        loadBookDetails();


    }, [book_id])

    return (

        <View>

            <Box>
                <UserInput
                    label="Book Name"
                    placeholder="Book Name"
                    value={book?.name || ""}
                    onChangeText={(text) => setBook((prev: any) => ({ ...prev, name: text }))}
                />




                <UserInput
                    label="Description"
                    placeholder="Description"
                    value={book?.description || ""}
                    onChangeText={(text) => setBook((prev: any) => ({ ...prev, description: text }))}
                />

                <Button
                    title="Save Changes"
                    color="$primary"
                    onPress={() => Alert.alert('Save', 'Changes saved (not really, this is just a placeholder)')}
                />

                <Button
                    title="Delete Book"
                    color="$accent"
                    onPress={() => Alert.alert('Delete', 'Book deleted (not really, this is just a placeholder)')}
                />

            </Box>


        </View>

    )

}