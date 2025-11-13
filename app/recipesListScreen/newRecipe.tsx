import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Image } from "dripsy";
import { Pressable, Alert, FlatList, Modal, View as RNView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import Entypo from '@expo/vector-icons/Entypo';
import { TouchableOpacity } from "react-native";
import PhotoPickerBox from '../../components/PhotoPickerBox'
import IngredientCard from "../../components/IngredientCard";

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

    const [unitModalVisible, setUnitModalVisible] = useState(false);

    const [ingredientName, setIngredientName] = useState("");
    const [ingredientQty, setIngredientQty] = useState("");
    const [ingredientUnit, setIngredientUnit] = useState("g");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

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

        // ✅ CHANGES FOR EDIT MODE
        if (editingIndex !== null) {
            const newIngredients = [...recipe.ingredients];
            newIngredients[editingIndex] = newIngredient;
            handleChange("ingredients", newIngredients);
            setEditingIndex(null); // reset edit mode
        } else {
            handleChange("ingredients", [...recipe.ingredients, newIngredient]);
        }

        // reset composer inputs
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

                <PhotoPickerBox
                    onChange={(uri) => setRecipe((r) => ({ ...r, image: uri }))}
                />




                {/* 🧂 Ingredients */}
                <Text variant="subheading" sx={{ mb: "s" }}>
                    Ingredients
                </Text>

                {/* ---------- Ingredient composer (polished) ---------- */}
                <View
                    sx={{
                        flexDirection: "row",
                        alignItems: "center",
                        bg: "white",
                        borderWidth: 1,
                        borderColor: "$border",
                        borderRadius: "l",
                        padding: "s",
                        mb: "m",
                        gap: 8,
                    }}
                >
                    {/* Name */}
                    <View sx={{ flex: 1 }}>
                        <TextInput
                            placeholder="Ingredient"
                            value={ingredientName}
                            onChangeText={setIngredientName}
                            sx={{
                                borderWidth: 1,
                                borderColor: "$border",
                                borderRadius: "m",
                                px: "s",
                                py: 10,
                                bg: "$muted",
                            }}
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <View
                                sx={{
                                    position: "absolute",
                                    top: 48,
                                    left: 0,
                                    right: 0,
                                    bg: "white",
                                    borderRadius: "m",
                                    borderWidth: 1,
                                    borderColor: "$border",
                                    zIndex: 50,
                                }}
                            >
                                {suggestions.map((s, idx) => (
                                    <Pressable
                                        key={idx}
                                        onPress={() => {
                                            setIngredientName(s.name);
                                            setShowSuggestions(false);
                                        }}
                                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                                    >
                                        <Text sx={{ p: "s" }}>{s.name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Qty */}
                    <TextInput
                        placeholder="Qty"
                        value={ingredientQty}
                        onChangeText={(t) => setIngredientQty(t.replace(/[^0-9.]/g, ""))}
                        keyboardType="numeric"
                        sx={{
                            width: 60,
                            borderWidth: 1,
                            borderColor: "$border",
                            borderRadius: "m",
                            px: "s",
                            py: 10,
                            bg: "$muted",
                            textAlign: "center",
                        }}
                    />

                    {/* Unit trigger */}
                    <Pressable
                        onPress={() => setUnitModalVisible(true)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    >
                        <View
                            sx={{
                                width: 70,
                                borderWidth: 1,
                                borderColor: "$border",
                                borderRadius: "m",
                                bg: "$muted",
                                justifyContent: "center",
                                alignItems: "center",
                                height: 46,
                                px: "s",
                                flexDirection: "row",
                                gap: 6,
                            }}
                        >
                            <Text sx={{ fontWeight: "600" }}>{ingredientUnit}</Text>
                            <Entypo name="chevron-down" size={16} color="#666" />
                        </View>
                    </Pressable>

                    {/* Add button */}
                    <Pressable
                        onPress={handleAddIngredient}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    >
                        <View
                            sx={{
                                width: 44,
                                height: 44,
                                backgroundColor: editingIndex !== null ? "#007bff" : "#28a745",
                                borderRadius: 999,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Entypo
                                name={editingIndex !== null ? "pencil" : "plus"}
                                size={20}
                                color={"white"}  // blue for update, green for add
                            />

                        </View>
                    </Pressable>
                </View>

                {/* ---------- Unit modal (bottom sheet) ---------- */}
                <Modal
                    visible={unitModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setUnitModalVisible(false)}
                >
                    {/* backdrop: close when tapped */}
                    <Pressable
                        onPress={() => setUnitModalVisible(false)}
                        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
                    />

                    {/* sheet */}
                    <RNView
                        style={{
                            position: "absolute",
                            left: 12,
                            right: 12,
                            bottom: 18,
                            borderRadius: 12,
                            overflow: "hidden",
                            backgroundColor: "white",
                            maxHeight: 320,
                            borderWidth: 1,
                            borderColor: "#eee",
                        }}
                    >
                        <View
                            sx={{
                                px: "m",
                                py: "s",
                                borderBottomWidth: 1,
                                borderBottomColor: "$border",
                                alignItems: "center",
                            }}
                        >
                            <View
                                style={{
                                    width: 36,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: "#ddd",
                                }}
                            />
                        </View>

                        <FlatList
                            data={units}
                            keyExtractor={(i) => i}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setIngredientUnit(item);
                                        setUnitModalVisible(false);
                                    }}
                                    style={({ pressed }) => [
                                        { paddingVertical: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
                                        pressed && { opacity: 0.6 },
                                    ]}
                                >
                                    <Text style={{ fontSize: 16 }}>{item}</Text>
                                    {item === ingredientUnit ? <Text style={{ color: "#2e8b57", fontWeight: 700 }}>✓</Text> : null}
                                </Pressable>
                            )}
                            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#f3f3f3" }} />}
                        />
                    </RNView>
                </Modal>




                {recipe.ingredients.length > 0 && (
                    <View sx={{ mb: "l" }}>
                        {recipe.ingredients.map((ing, index) => (
                            <IngredientCard
                                key={index}
                                ingredient={ing}
                                isEditing={editingIndex === index}
                                onRemove={() => handleRemoveIngredient(index)}
                                onEdit={() => {
                                    setIngredientName(ing.name);
                                    setIngredientQty(ing.quantity?.toString() || "");
                                    setIngredientUnit(ing.unit);
                                    setEditingIndex(index)
                                }}
                            />
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
