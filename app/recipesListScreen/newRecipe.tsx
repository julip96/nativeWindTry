import React from "react";
import { View, Text, TextInput, ScrollView, Image } from "dripsy";
import { Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../utils/supabase";
import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from "expo-router";

export default function NewRecipe() {

    const { book_id } = useLocalSearchParams()

    const router = useRouter()

    const [userId, setUserId] = useState<string | null>(null)

    const [recipe, setRecipe] = useState({

        title: '',
        ingredients: '',
        instructions: '',
        image: ''

    })

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error);
                return;
            }
            setUserId(data?.user?.id ?? null);
        };

        fetchUser();
    }, []);

    function handleChange(key: keyof typeof recipe, value: string) {
        setRecipe((prev) => ({ ...prev, [key]: value }));
    }

    // 📷 Pick image from gallery
    async function handlePickImage() {

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {

            Alert.alert("Permission required", "We need access to your photos!");
            return;

        }

        const result = await ImagePicker.launchImageLibraryAsync({

            mediaTypes: ImagePicker.MediaTypeOptions.Images, // deprecated, replace
            allowsEditing: true,
            quality: 0.8,

        });

        if (!result.canceled && result.assets.length > 0) {

            handleChange("image", result.assets[0].uri);

        }

    }

    // 📸 Take photo with camera
    async function handleTakePhoto() {

        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {

            Alert.alert("Permission required", "We need access to your camera!");
            return;

        }

        const result = await ImagePicker.launchCameraAsync({

            mediaTypes: ImagePicker.MediaTypeOptions.Images, // deprecated, replace
            allowsEditing: true,
            quality: 0.8,

        });

        if (!result.canceled && result.assets.length > 0) {

            handleChange("image", result.assets[0].uri);

        }

    }

    // 💾 Save recipe
    async function handleSaveRecipe() {

        console.log('saving recipe...', { book_id })

        if (!userId || !book_id) {
            Alert.alert('Error', 'Mising user or book info');
            return;
        }

        try {

            const { data, error } = await supabase
                .from('recipes')
                .insert([

                    {

                        user_id: userId,
                        book_id,
                        image_url: recipe.image,
                        title: recipe.title,
                        ingredients: recipe.ingredients,
                        instructions: recipe.instructions,
                        rating: 0,
                        private: true,

                    },

                ])
                .select()

            if (error) throw error



            Alert.alert('Success, Recipe saved!');
            router.back()

        } catch (e) {

            console.error("Error saving recipe:", e);
            Alert.alert('Error', 'Could not save recipe.')

        }

    }

    return (

        <ScrollView

            sx={{

                p: "m",
                bg: "$background",
                flex: 1,

            }}

        >

            <View>

                <Text variant="heading" sx={{ mb: "m" }}>

                    New Recipe

                </Text>

                <TextInput

                    sx={{ bg: "$background", mb: "s" }}
                    placeholder="Recipe Title"
                    value={recipe.title}
                    onChangeText={(text) => handleChange("title", text)}

                />

                {/* 📸 Select or Take Photo buttons */}
                <View sx={{ flexDirection: "row", justifyContent: "space-between" }}>

                    <Pressable

                        android_ripple={{ color: "#ccc" }}
                        onPress={handlePickImage}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}

                    >
                        <View

                            sx={{

                                bg: "$secondary",
                                p: "m",
                                borderRadius: "m",
                                alignItems: "center",
                                justifyContent: "center",
                                mt: "s",
                                width: 150,

                            }}

                        >

                            <Text sx={{ color: "white", fontWeight: "bold" }}>From Gallery</Text>

                        </View>

                    </Pressable>

                    <Pressable

                        android_ripple={{ color: "#ccc" }}
                        onPress={handleTakePhoto}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}

                    >
                        <View

                            sx={{

                                bg: "$primary",
                                p: "m",
                                borderRadius: "m",
                                alignItems: "center",
                                justifyContent: "center",
                                mt: "s",
                                width: 150,

                            }}

                        >

                            <Text sx={{ color: "white", fontWeight: "bold" }}>Take Photo</Text>

                        </View>

                    </Pressable>

                </View>

                {/* ✅ Preview selected image */}
                {recipe.image ? (

                    <View

                        sx={{

                            alignItems: "center",
                            justifyContent: "center",
                            mt: "m",
                            mb: "m",

                        }}

                    >

                        <Image

                            source={{ uri: recipe.image }}

                            style={{

                                width: 200,
                                height: 200,
                                borderRadius: 10,
                                resizeMode: "cover",

                            }}

                        />

                    </View>

                ) : null}

                <TextInput

                    sx={{ bg: "$background", mb: "s" }}
                    placeholder="Ingredients"
                    multiline
                    value={recipe.ingredients}
                    onChangeText={(text) => handleChange("ingredients", text)}

                />

                <TextInput

                    sx={{ bg: "$background", mb: "s" }}
                    placeholder="Instructions"
                    multiline
                    value={recipe.instructions}
                    onChangeText={(text) => handleChange("instructions", text)}

                />

                {/* 💾 Save */}
                <Pressable

                    android_ripple={{ color: "#ccc" }}
                    onPress={() => handleSaveRecipe()}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}

                >
                    <View

                        sx={{

                            bg: "$primary",
                            p: "m",
                            borderRadius: "m",
                            alignItems: "center",
                            justifyContent: "center",
                            mt: "s",

                        }}

                    >

                        <Text sx={{ color: "white", fontWeight: "bold" }}>Save</Text>

                    </View>

                </Pressable>

            </View>

        </ScrollView>

    );

}
