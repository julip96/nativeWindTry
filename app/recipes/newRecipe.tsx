import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView } from "dripsy";
import { Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import PhotoPickerBox from "../../components/PhotoPickerBox";

export default function NewRecipe() {
    const { book_id } = useLocalSearchParams(); // optional vorgegebene Kochbuch-ID
    const router = useRouter();

    const [userId, setUserId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [instructions, setInstructions] = useState("");
    const [image, setImage] = useState<string | null>(null);

    const [focusedField, setFocusedField] = useState<string | null>(null);
    // Kochbücher
    const [books, setBooks] = useState<{ id: string; name: string }[]>([]);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);


    // Zutaten
    const [ingredients, setIngredients] = useState<{ amount: string; unit: string; name: string }[]>([
        { amount: "", unit: "g", name: "" },
    ]);

    const units = ["-", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "pcs"];

    // 👤 Lade User und Kochbücher
    useEffect(() => {
        const fetchUserAndBooks = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                console.error("Error fetching user:", userError);
                return;
            }
            setUserId(userData.user.id);

            const { data: booksData, error: booksError } = await supabase
                .from("recipe_books")
                .select("*")
                .eq("owner_id", userData.user.id)
                .order("name");

            if (booksError) console.error("Error fetching cookbooks:", booksError);
            else setBooks(booksData || []);

            // falls ein book_id übergeben wurde, sicherstellen dass es existiert
            if (book_id && booksData?.some((b) => b.id === book_id)) {
                setSelectedBookId(book_id as string);
            }

        };

        fetchUserAndBooks();

    }, []);

    // 🧾 Zutatenzeilen-Funktionen
    const handleIngredientChange = (
        index: number,
        field: "amount" | "unit" | "name",
        value: string
    ) => {
        const updated = [...ingredients];
        updated[index][field] = value;
        setIngredients(updated);
    };

    const handleAddIngredientRow = () => {
        setIngredients([...ingredients, { amount: "", unit: "g", name: "" }]);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    // 📷 Bildpicker
    const handlePickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return Alert.alert("Permission required", "We need access to your photos!");

        const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
        if (!result.canceled && result.assets.length > 0) setImage(result.assets[0].uri);
    };

    const handleTakePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return Alert.alert("Permission required", "We need access to your camera!");

        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
        if (!result.canceled && result.assets.length > 0) setImage(result.assets[0].uri);
    };

    // 💾 Save Recipe
    const handleSaveRecipe = async () => {
        if (!userId || !selectedBookId) return Alert.alert("Error", "Missing user or cookbook");

        // Zutaten validieren
        const validIngredients = ingredients
            .filter((i) => i.name.trim() !== "")
            .map((i) => ({
                name: i.name.trim(),
                amount: i.amount ? parseFloat(i.amount) : null,
                unit: i.unit || "g",
            }));

        try {
            const { data: recipeData, error } = await supabase
                .from("recipes")
                .insert([
                    {
                        user_id: userId,
                        book_id: selectedBookId,
                        title,
                        instructions,
                        image_url: image,
                        ingredients: JSON.stringify(validIngredients),
                        rating: 0,
                        private: true,
                    },
                ])
                .select()
                .single();

            if (error) throw error;
            Alert.alert("Success", "Recipe saved!");
            router.back();
        } catch (e) {
            console.error("Error saving recipe:", e);
            Alert.alert("Error", "Could not save recipe.");
        }
    };

    return (
        <ScrollView sx={{ p: "m", bg: "$background", flex: 1 }}>
            <View>
                <Text variant="heading" sx={{ mb: "m" }}>
                    New Recipe
                </Text>

                {/* Titel */}
                <TextInput
                    sx={{ bg: "$background", mb: "s" }}
                    placeholder="Recipe Title"
                    value={title}
                    onChangeText={setTitle}
                />

                {/* 📸 Bildpicker */}
                <View sx={{ flexDirection: "row", justifyContent: "space-between", mb: "m" }}>
                    <Pressable onPress={handlePickImage} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                        <View sx={{ bg: "$secondary", p: "m", borderRadius: "m", alignItems: "center", justifyContent: "center", width: 150 }}>
                            <Text sx={{ color: "white", fontWeight: "bold" }}>From Gallery</Text>
                        </View>
                    </Pressable>

                    <Pressable onPress={handleTakePhoto} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                        <View sx={{ bg: "$primary", p: "m", borderRadius: "m", alignItems: "center", justifyContent: "center", width: 150 }}>
                            <Text sx={{ color: "white", fontWeight: "bold" }}>Take Photo</Text>
                        </View>
                    </Pressable>
                </View>

                {image && (
                    <PhotoPickerBox onChange={setImage} uri={image} />
                )}

                {/* 🏷 Kochbuch Picker */}
                <Text sx={{ fontWeight: "bold", mb: "s" }}>Cookbook</Text>
                <View sx={{ borderWidth: 1, borderColor: "$border", borderRadius: "m", overflow: "hidden", mb: "m" }}>
                    <Picker
                        selectedValue={selectedBookId}
                        onValueChange={(val) => setSelectedBookId(val)}
                        style={{ height: 50 }}
                    >

                        {/* Fester Standardwert */}
                        <Picker.Item label="No specific Cookbook" value={null} />

                        {books.map((b) => (
                            <Picker.Item key={b.id} label={b.name} value={b.id} />
                        ))}
                    </Picker>
                </View>

                {/* 🧂 Zutaten */}
                <Text sx={{ fontWeight: "bold", mb: "s" }}>Ingredients</Text>
                {ingredients.map((item, index) => (
                    <View key={index} sx={{ flexDirection: "row", alignItems: "center", mb: "xs", bg: "$muted", p: "s", borderRadius: "m" }}>
                        <TextInput
                            sx={{ width: 60, bg: "white", p: "s", mr: "s", textAlign: "center" }}
                            placeholder="Amt"
                            value={item.amount}
                            keyboardType="numeric"
                            onChangeText={(text) => handleIngredientChange(index, "amount", text)}
                        />
                        <View sx={{ borderWidth: 1, borderColor: "$border", borderRadius: "m", overflow: "hidden", bg: "white", width: 100, mr: "s" }}>
                            <Picker
                                selectedValue={item.unit}
                                onValueChange={(val) => handleIngredientChange(index, "unit", val)}
                            >
                                {units.map((u) => (
                                    <Picker.Item key={u} label={u} value={u} />
                                ))}
                            </Picker>
                        </View>
                        <TextInput
                            sx={{ flex: 1, bg: "white", p: "s" }}
                            placeholder="Name"
                            value={item.name}
                            onChangeText={(text) => handleIngredientChange(index, "name", text)}
                        />
                        <Pressable onPress={() => handleRemoveIngredient(index)}>
                            <Ionicons name="trash" size={22} color="red" />
                        </Pressable>
                    </View>
                ))}

                <Pressable onPress={handleAddIngredientRow} sx={{ mt: "s" }}>
                    <View sx={{ bg: "$primary", p: "s", borderRadius: "m", alignItems: "center" }}>
                        <Text sx={{ color: "white", fontWeight: "bold" }}>+ Add Ingredient</Text>
                    </View>
                </Pressable>

                {/* Instructions */}
                <Text sx={{ fontWeight: "bold", mt: "m", mb: "s" }}>Instructions</Text>
                <TextInput
                    sx={{ bg: "$muted", p: "s", borderRadius: "m", minHeight: 100, textAlignVertical: "top" }}
                    multiline
                    placeholder="Instructions"
                    value={instructions}
                    onChangeText={setInstructions}
                />

                {/* Save */}
                <Pressable onPress={handleSaveRecipe} sx={{ mt: "m" }}>
                    <View sx={{ bg: "$primary", p: "m", borderRadius: "m", alignItems: "center" }}>
                        <Text sx={{ color: "white", fontWeight: "bold" }}>Save</Text>
                    </View>
                </Pressable>
            </View>
        </ScrollView>
    );
}
