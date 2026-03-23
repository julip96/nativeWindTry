import React, { useEffect, useRef, useState } from "react";
import type { ScrollView as ScrollViewType } from 'react-native';
import { TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { Pressable, View, Text, TextInput, ScrollView, Image } from "dripsy";
import { Alert, KeyboardAvoidingView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import PhotoPickerBox from "@/components/PhotoPickerBox";

import Box from "@/components/Box";

import UserInput from "@/components/UserInput";

import Button from "@/components/Button";

export default function EditRecipeScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    /* CHANGED START */
    // ingredients now uses `amount` instead of `quantity` to match DB
    const [ingredients, setIngredients] = useState<
        { amount: string; unit: string; name: string }[]
    >([]);
    /* CHANGED END */

    const [title, setTitle] = useState("");
    const [instructions, setInstructions] = useState("");
    const [image, setImage] = useState<string | null>(null);

    const [userId, setUserId] = useState<string | null>(null);

    // Kochbücher
    const [books, setBooks] = useState<{ id: string; name: string }[]>([]);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

    const [focusedField, setFocusedField] = useState<string | null>(null);

    const units = ["-", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "pcs"];


    const validateName = (text: string) => {
        if (!text || text.trim().length === 0) return 'Name darf nicht leer sein';
        if (text.length < 3) return 'Name muss mindestens 3 Zeichen lang sein';
        return true;
    };

    const validateInstructions = (text: string) => {
        if (!text || text.trim().length === 0) return 'Instructions darf nicht leer sein';
        if (text.length < 3) return 'Instructions muss mindestens 3 Zeichen lang sein';
        return true;
    };

    const validateAmount = (text: string) => {
        if (!text || text.trim().length === 0) return 'Amount darf nicht leer sein';

        // Prüfen, ob nur Zahlen (0-9) eingegeben wurden
        const numberOnlyRegex = /^[0-9]+$/;
        if (!numberOnlyRegex.test(text)) return 'Bitte nur Zahlen eingeben';

        if (text.length < 1) return 'Amount muss mindestens 1 Zeichen lang sein';

        return true;
    };

    const scrollViewRef = useRef<ScrollViewType | null>(null);


    const handleFocus = (field: string) => {
        setFocusedField(field);
    };

    const clearFocus = () => {
        setFocusedField(null);
    };

    useEffect(() => {
        const loadRecipe = async () => {

            if (!id) return;

            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                throw userError;
            }
            setUserId(userData.user.id);

            const { data: booksData, error: booksError } = await supabase
                .from("recipe_books")
                .select("id, name")
                .eq("owner_id", userData.user.id)
                .order("name");

            if (booksError) {
                console.error("Error loading cookbooks:", booksError);
            } else {
                setBooks(booksData || []);
            }


            try {
                const { data, error } = await supabase
                    .from("recipes")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                setTitle(data.title || "");
                setInstructions(data.instructions || "");
                setImage(data.image_url || "");
                setSelectedBookId(data.book_id);

                try {
                    const parsedIngredients =
                        typeof data.ingredients === "string"
                            ? JSON.parse(data.ingredients)
                            : data.ingredients;

                    if (Array.isArray(parsedIngredients)) {
                        setIngredients(
                            parsedIngredients.map((ing) => ({
                                amount: ing.amount ?? "",

                                unit: ing.unit ?? "",
                                name: ing.name ?? "",
                            }))
                        );
                    } else {
                        setIngredients([]);
                    }

                } catch {
                    setIngredients([]);
                }


            } catch (e) {
                console.error("Error loading recipe:", e);
                Alert.alert("Error", "Could not load recipe.");
            }
        };
        loadRecipe();
    }, [id]);

    // 🧾 Add a new ingredient
    const handleAddIngredient = () => {
        setIngredients([...ingredients, { amount: "", unit: "", name: "" }]);
    };

    // 🧹 Remove ingredient
    const handleRemoveIngredient = (index: number) => {
        setIngredients((prev) => prev.filter((_, i) => i !== index));
    };

    // ✏️ Update ingredient field
    const handleIngredientChange = (
        index: number,
        field: "amount" | "unit" | "name",
        value: string
    ) => {
        const updated = [...ingredients];
        updated[index][field] = value;
        setIngredients(updated);
    };

    async function handlePickImage() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "We need access to your photos!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    }

    async function handleTakePhoto() {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "We need access to your camera!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    }

    // 💾 Update recipe
    async function handleUpdateRecipe() {
        if (!id) {
            Alert.alert("Error", "Missing recipe ID.");
            return;
        }

        try {
            const { error } = await supabase
                .from("recipes")
                .update({
                    title,
                    ingredients: JSON.stringify(ingredients),
                    instructions,
                    image_url: image,
                    book_id: selectedBookId,
                })
                .eq("id", id);

            if (error) throw error;

            Alert.alert("Success", "Recipe updated!");
            router.replace((`/recipes/${id}`))

        } catch (e) {
            console.error("Error updating recipe:", e);
            Alert.alert("Error", "Could not update recipe.");
        }
    }

    console.log("ingredients:", ingredients);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // je nach Header-Höhe anpassen
        >
            <ScrollView sx={{ p: "m", bg: "$background", flex: 1, }} keyboardShouldPersistTaps="handled">
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss();
                        setFocusedField(null);
                    }}
                >
                    <View>
                        <Text variant="heading" sx={{ mb: "m" }}>
                            Edit Recipe
                        </Text>

                        <Box>
                            <UserInput
                                label="Title"
                                placeholder="Recipe Title"
                                value={title}
                                onChangeText={setTitle}
                                validate={validateName}
                            />
                        </Box>

                        {/* Cookbook */}
                        <Text variant="heading">Cookbook</Text>
                        <Box>
                            <Picker
                                // changed from {selectedBookId}
                                selectedValue={selectedBookId ? selectedBookId : null}
                                onFocus={() => handleFocus("book")}
                                onValueChange={(val) => {
                                    setSelectedBookId(val);
                                    setFocusedField(null);
                                }}
                            >
                                {books.map((b) => (
                                    <Picker.Item key={b.id} label={b.name} value={b.id} />
                                ))}
                            </Picker>
                        </Box>




                        {/* 📸 Bildpicker Buttons */}
                        <View sx={{ flexDirection: "row", justifyContent: "space-between", mb: "m" }}>
                            <Pressable onPress={handlePickImage}>
                                <View
                                    sx={{
                                        bg: "$secondary",
                                        p: "m",
                                        borderRadius: "m",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 150,
                                    }}
                                >
                                    <Text sx={{ color: "white", fontWeight: "bold" }}>From Gallery</Text>
                                </View>
                            </Pressable>

                            <Pressable onPress={handleTakePhoto}>
                                <View
                                    sx={{
                                        bg: "$primary",
                                        p: "m",
                                        borderRadius: "m",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 150,
                                    }}
                                >
                                    <Text sx={{ color: "white", fontWeight: "bold" }}>Take Photo</Text>
                                </View>
                            </Pressable>
                        </View>

                        {/* 🖼 Bildanzeige – IDENTISCH zu NewRecipe */}
                        {image && (
                            <PhotoPickerBox onChange={setImage} uri={image} />
                        )}

                        {/* 🧂 Ingredients */}
                        <Text variant="heading">Ingredients</Text>

                        {ingredients.map((item, index) => (
                            <Box
                                key={index}
                            >
                                <View sx={{ flexDirection: "row", alignItems: "center" }}>
                                    <TextInput
                                        sx={{
                                            width: 70,
                                            mr: "s",
                                            textAlign: "center",
                                            height: "90%",
                                        }}
                                        placeholder="Amt"
                                        value={item.amount}
                                        keyboardType="numeric"
                                        onFocus={() => handleFocus(`amt-${index}`)}
                                        onChangeText={(text) =>
                                            handleIngredientChange(index, "amount", text)
                                        }
                                    />

                                    <View
                                        sx={{
                                            width: 120,
                                            height: "90%",
                                            mr: "s",
                                            p: 1,
                                        }}
                                    >
                                        <Picker
                                            selectedValue={item.unit}
                                            onFocus={() => handleFocus(`unit-${index}`)}
                                            onValueChange={(val) => {
                                                handleIngredientChange(index, "unit", val);
                                                setFocusedField(null);
                                            }}
                                        >
                                            {units.map((u) => (
                                                <Picker.Item key={u} label={u} value={u} />
                                            ))}
                                        </Picker>
                                    </View>

                                    <TextInput
                                        sx={{
                                            flex: 1,
                                            height: "90%",
                                        }}
                                        placeholder="Ingredient Name"
                                        value={item.name}
                                        onFocus={() => handleFocus(`name-${index}`)}
                                        onChangeText={(text) =>
                                            handleIngredientChange(index, "name", text)
                                        }
                                    />

                                    <Pressable
                                        onPress={() => handleRemoveIngredient(index)}
                                        sx={{ m: "s" }}
                                    >
                                        <Ionicons name="trash" size={22} color="red" />
                                    </Pressable>
                                </View>
                            </Box>
                        ))}




                        {/* ➕ Add Ingredient */}
                        <Button title="+ Add Ingredient" onPress={handleAddIngredient} color="$primary" />

                        {/* ✍️ Instructions */}
                        <Text variant="heading">Instructions</Text>
                        <Box flexDir="column">
                            <UserInput
                                label="Instructions"
                                placeholder="Step-by-step Instructions"
                                value={instructions}
                                onChangeText={setInstructions}
                                validate={validateInstructions}
                                multiline
                                onFocus={() => {
                                    scrollViewRef.current?.scrollToEnd({ animated: true });
                                }}
                            />

                        </Box>

                        {/* 💾 Save Changes */}
                        {/* Save */}

                        <Button title="Update Recipe" onPress={handleUpdateRecipe} color="$accent" />

                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
