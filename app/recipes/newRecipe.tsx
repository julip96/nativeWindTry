import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "dripsy";
import { Keyboard, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import PhotoPickerBox from "../../components/PhotoPickerBox";
import { TouchableWithoutFeedback } from "react-native";


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

    const handleFocus = (field: string) => {
        setFocusedField(field);
    };

    const clearFocus = () => {
        setFocusedField(null);
    };



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

    /** 🔹 Shared input style */
    const inputStyle = (field: string) => ({

        mb: "s",
        bg: "$background",
        p: "s",
        borderRadius: "m",
        borderColor: focusedField === field ? "$secondary" : "$primary", borderWidth: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 3,

    });

    return (
        <ScrollView sx={{ p: "m", bg: "$background", flex: 1 }}>
            <TouchableWithoutFeedback
                onPress={() => {
                    Keyboard.dismiss();
                    setFocusedField(null);
                }}
            >
                <View>
                    <Text variant="heading" sx={{ mb: "m" }}>
                        New Recipe
                    </Text>

                    {/* Title */}
                    <Text sx={{ fontWeight: "bold", mb: "xs" }}>Recipe Title</Text>
                    <TextInput
                        sx={{
                            ...inputStyle("title"), mb: "m",

                        }}
                        placeholder="e.g. Creamy Mushroom Pasta"
                        value={title}
                        onFocus={() => handleFocus("title")}
                        onChangeText={setTitle}

                    />

                    {/* Cookbook */}
                    <Text sx={{ fontWeight: "bold", mb: "xs" }}>Cookbook</Text>
                    <View sx={{ ...inputStyle("book"), mb: "m", p: 0 }}>
                        <Picker
                            selectedValue={selectedBookId}
                            onFocus={() => handleFocus("book")}
                            onValueChange={(val) => {
                                setSelectedBookId(val);
                                setFocusedField(null);
                            }}
                        >
                            <Picker.Item label="No specific cookbook" value={null} />
                            {books.map((b) => (
                                <Picker.Item key={b.id} label={b.name} value={b.id} />
                            ))}
                        </Picker>
                    </View>

                    {/* 🧂 Zutaten */}
                    <Text sx={{ fontWeight: "bold", mb: "s" }}>Ingredients</Text>
                    {ingredients.map((item, index) => (
                        <View
                            key={index}
                            sx={{
                                mb: "s",
                                bg: "$background",
                                p: "s",
                                borderRadius: "m",
                                borderColor: "$primary",
                                borderWidth: 1,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 10,
                                elevation: 3,

                            }}>
                            <View sx={{ flexDirection: "row", alignItems: "center" }}>
                                <TextInput
                                    sx={{ ...inputStyle(`amt-${index}`), width: 70, mr: "s", textAlign: "center", height: '90%' }}
                                    placeholder="Amt"
                                    value={item.amount}
                                    keyboardType="numeric"
                                    onFocus={() => handleFocus(`amt-${index}`)}
                                    onChangeText={(text) =>
                                        handleIngredientChange(index, "amount", text)
                                    }
                                />


                                <View sx={{ ...inputStyle(`unit-${index}`), width: 120, height: '90%', mr: "s", p: 1 }}>
                                    <Picker
                                        selectedValue={item.unit}
                                        onFocus={() => handleFocus(`unit-${index}`)}
                                        onValueChange={(val) => {
                                            handleIngredientChange(index, "unit", val);
                                            setFocusedField(null)
                                        }}
                                    >
                                        {units.map((u) => (
                                            <Picker.Item key={u} label={u} value={u} />
                                        ))}
                                    </Picker>
                                </View>

                                <TextInput
                                    sx={{ ...inputStyle(`name-${index}`), flex: 1, height: '90%' }}
                                    placeholder="Ingredient Name"
                                    value={item.name}
                                    onFocus={() => handleFocus(`name-${index}`)}
                                    onChangeText={(text) => handleIngredientChange(index, "name", text)}
                                />

                                <Pressable onPress={() => handleRemoveIngredient(index)} sx={{ m: "s" }}>
                                    <Ionicons name="trash" size={22} color="red" />
                                </Pressable>
                            </View>
                        </View>
                    ))}

                    <Pressable onPress={handleAddIngredientRow} >
                        <View sx={{
                            bg: "$primary", p: "m", borderRadius: "m", alignItems: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 3,
                        }}>
                            <Text sx={{ color: "$text", fontWeight: "bold" }}>+ Add Ingredient</Text>
                        </View>
                    </Pressable>

                    {/* Instructions */}
                    <Text sx={{ fontWeight: "bold", mt: "m", mb: "xs" }}>Instructions</Text>
                    <TextInput
                        sx={{
                            ...inputStyle("instructions"),
                            minHeight: 120,
                            textAlignVertical: "top",
                            mb: "m",
                        }}
                        multiline
                        placeholder="Step-by-step Instructions"
                        value={instructions}
                        onFocus={() => handleFocus("instructions")}
                        onChangeText={setInstructions}
                    />

                    {/* Save */}
                    <Pressable onPress={handleSaveRecipe}>
                        <View sx={{
                            bg: "$primary", p: "m", borderRadius: "m", alignItems: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 3,
                        }}>
                            <Text sx={{ color: "$text", fontWeight: "bold" }}>Save</Text>
                        </View>
                    </Pressable>
                </View>
            </TouchableWithoutFeedback>
        </ScrollView>
    );
}
