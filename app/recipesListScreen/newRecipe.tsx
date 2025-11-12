import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Image } from "dripsy";
import { Pressable, Alert, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"

export default function NewRecipe() {

    const { book_id } = useLocalSearchParams()
    const router = useRouter()

    const [userId, setUserId] = useState<string | null>(null)

    const [recipe, setRecipe] = useState({

        title: '',
        ingredients: [],
        instructions: '',
        image: ''

    })

    const [ingredientName, setIngredientName] = useState("");
    const [ingredientQty, setIngredientQty] = useState("");
    const [ingredientUnit, setIngredientUnit] = useState("g");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const units = ["-", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "pcs"];

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

    function handleChange(key: keyof typeof recipe, value: any) {
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

    // 🧠 Fetch ingredient name suggestions
    useEffect(() => {
        if (ingredientName.trim().length > 1) {
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [ingredientName]);

    async function fetchSuggestions() {
        const { data, error } = await supabase
            .from("ingredients_catalog")
            .select("name")
            .ilike("name", `%${ingredientName}%`)
            .limit(5);

        if (!error) {
            console.warn("Error fetching suggestions:", error)
            setShowSuggestions(false);
        }
        setSuggestions(data || []);
        setShowSuggestions(true);
    }

    // ➕ Add an ingredient
    async function handleAddIngredient() {
        if (!ingredientName.trim()) return;
        if (ingredientQty && isNaN(Number(ingredientQty))) {
            Alert.alert("Invalid amount", "Please enter a number for quantity.");
            return;
        }

        let ingredientId;

        // Check if ingredient exists in catalog
        const { data: existing } = await supabase
            .from("ingredients_catalog")
            .select("id")
            .ilike("name", ingredientName.trim())
            .single();

        if (existing) {
            ingredientId = existing.id;
        } else {
            const { data: newIng, error } = await supabase
                .from("ingredients_catalog")
                .insert([{ name: ingredientName.trim() }])
                .select()
                .single();

            if (error) console.warn("Catalog insert error:", error);
            ingredientId = newIng?.id;
        }

        const newIngredient = {
            name: ingredientName.trim(),
            quantity: ingredientQty ? parseFloat(ingredientQty) : null,
            unit: ingredientUnit,
            ingredient_id: ingredientId,
        };

        handleChange("ingredients", [...recipe.ingredients, newIngredient]);
        setIngredientName("");
        setIngredientQty("");
        setIngredientUnit("g");
        setShowSuggestions(false);
    }

    // 🗑️ Remove ingredient
    const handleRemoveIngredient = (index: number) => {
        handleChange(
            "ingredients",
            recipe.ingredients.filter((_, i) => i !== index)
        );
    };

    // 💾 Save recipe
    async function handleSaveRecipe() {

        if (!userId || !book_id) {

            Alert.alert('Error', 'Mising user or book info');
            return;

        }

        const ingredientsJSON = JSON.stringify(recipe.ingredients);

        try {

            const { data: recipeData, error } = await supabase
                .from('recipes')
                .insert([

                    {

                        user_id: userId,
                        book_id,
                        image_url: recipe.image,
                        title: recipe.title,
                        instructions: recipe.instructions,
                        ingredients: ingredientsJSON,
                        rating: 0,
                        private: true,

                    },

                ])
                .select()
                .single();

            if (error) throw error

            // Save ingredients to linking table
            await supabase.from("recipe_ingredients").insert(
                recipe.ingredients.map((ing) => ({
                    recipe_id: recipeData.id,
                    ingredient_id: ing.ingredient_id,
                    quantity: ing.quantity,
                    unit: ing.unit,
                }))
            );

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

                {/* 🧂 Ingredients */}
                <Text variant="subheading" sx={{ mb: "s" }}>
                    Ingredients
                </Text>

                <View sx={{ flexDirection: "row", gap: 8, mb: "s", alignItems: "center" }}>
                    <View sx={{ flex: 1 }}>
                        <TextInput
                            placeholder="Name"
                            value={ingredientName}
                            onChangeText={setIngredientName}
                            sx={{
                                borderWidth: 1,
                                borderColor: "$border",
                                p: "s",
                                borderRadius: "m",
                                bg: "$muted",
                            }}
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <View sx={{ bg: "white", borderRadius: "m", mt: 2 }}>
                                {suggestions.map((s, idx) => (
                                    <Pressable
                                        key={idx}
                                        onPress={() => {
                                            setIngredientName(s.name);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <Text sx={{ p: "s" }}>{s.name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    <TextInput
                        placeholder="Qty"
                        value={ingredientQty}
                        onChangeText={(t) => setIngredientQty(t.replace(/[^0-9.]/g, ""))}
                        keyboardType="numeric"
                        sx={{
                            width: 70,
                            borderWidth: 1,
                            borderColor: "$border",
                            p: "s",
                            borderRadius: "m",
                            bg: "$muted",
                        }}
                    />

                    <View
                        sx={{
                            borderWidth: 1,
                            borderColor: "$border",
                            borderRadius: "m",
                            overflow: "hidden",
                            bg: "$muted",
                            width: 90,
                        }}
                    >
                        <Picker selectedValue={ingredientUnit} onValueChange={setIngredientUnit} style={{ height: 40 }}>
                            {units.map((u) => (
                                <Picker.Item key={u} label={u} value={u} />
                            ))}
                        </Picker>
                    </View>

                    <Pressable onPress={handleAddIngredient}>
                        <Ionicons name="add-circle" size={32} color="#2e8b57" />
                    </Pressable>
                </View>

                {recipe.ingredients.length > 0 && (
                    <View sx={{ mb: "l" }}>
                        {recipe.ingredients.map((ing: any, index: number) => (
                            <View
                                key={index}
                                sx={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    bg: "$muted",
                                    p: "s",
                                    borderRadius: "m",
                                    mb: "xs",
                                }}
                            >
                                <Text>{`${ing.name} — ${ing.quantity || ""} ${ing.unit}`}</Text>
                                <Pressable onPress={() => handleRemoveIngredient(index)}>
                                    <Ionicons name="trash-outline" size={22} color="red" />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}

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
