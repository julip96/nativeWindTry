import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Image } from "dripsy";
import { Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function EditRecipeScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [instructions, setInstructions] = useState("");
    const [image, setImage] = useState("");
    const [ingredients, setIngredients] = useState<
        { quantity: string; unit: string; name: string }[]
    >([]);

    useEffect(() => {
        const loadRecipe = async () => {
            if (!id) return;
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

                try {
                    const parsedIngredients =
                        typeof data.ingredients === "string"
                            ? JSON.parse(data.ingredients)
                            : data.ingredients;

                    if (Array.isArray(parsedIngredients)) {
                        setIngredients(
                            parsedIngredients.map((ing) => ({
                                quantity: ing.quantity ?? "",
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
        setIngredients([...ingredients, { quantity: "", unit: "", name: "" }]);
    };

    // 🧹 Remove ingredient
    const handleRemoveIngredient = (index: number) => {
        const updated = ingredients.filter((_, i) => i !== index);
        setIngredients(updated);
    };

    // ✏️ Update ingredient field
    const handleIngredientChange = (
        index: number,
        field: "quantity" | "unit" | "name",
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
                })
                .eq("id", id);

            if (error) throw error;

            Alert.alert("Success", "Recipe updated!");
            router.replace((`/recipesListScreen/${id}`))

        } catch (e) {
            console.error("Error updating recipe:", e);
            Alert.alert("Error", "Could not update recipe.");
        }
    }

    return (
        <ScrollView sx={{ p: "m", bg: "$background", flex: 1 }}>
            <View>
                <Text variant="heading" sx={{ mb: "m" }}>
                    Edit Recipe
                </Text>

                <TextInput
                    sx={{ bg: "$background", mb: "s" }}
                    placeholder="Recipe Title"
                    value={title}
                    onChangeText={setTitle}
                />

                {/* 📸 Image Buttons */}
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
                {image ? (
                    <View sx={{ alignItems: "center", mt: "m", mb: "m" }}>
                        <Image
                            source={{ uri: image }}
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
                <Text sx={{ fontWeight: "bold", mt: "m", mb: "s" }}>Ingredients</Text>

                {ingredients.map((item, index) => (
                    <View
                        key={index}
                        sx={{
                            flexDirection: "row",
                            alignItems: "center",
                            mb: "xs",
                            bg: "$muted",
                            p: "s",
                            borderRadius: "m",
                        }}
                    >
                        {/* Amount */}
                        <TextInput
                            sx={{
                                bg: "white",
                                borderRadius: "s",
                                p: "s",
                                width: 60,
                                mr: "s",
                                textAlign: "center",
                            }}
                            placeholder="Amt"
                            value={item.quantity ? String(item.quantity) : ""}
                            keyboardType="numeric"
                            onChangeText={(text) => handleIngredientChange(index, "quantity", text)}
                        />

                        {/* Unit Picker */}
                        {/* Unit Picker */}
                        <View
                            sx={{
                                borderWidth: 1,
                                borderColor: "$border",
                                borderRadius: "m",
                                overflow: "hidden",
                                bg: "white",
                                width: 100,
                                mr: "s",
                            }}
                        >
                            <Picker
                                selectedValue={
                                    ["g", "kg", "ml", "l", "tsp", "tbsp", "cup", "pcs"].includes(item.unit)
                                        ? item.unit
                                        : "" // fallback if stored unit is slightly different (e.g., "piece")
                                }
                                onValueChange={(value) => handleIngredientChange(index, "unit", value)}
                                style={{
                                    height: 40,
                                    color: "#000", // visible black text
                                    backgroundColor: "white",
                                }}
                                dropdownIconColor="#000"
                                mode="dropdown"
                            >
                                <Picker.Item label="-" value="" color="#000" />
                                <Picker.Item label="g" value="g" color="#000" />
                                <Picker.Item label="kg" value="kg" color="#000" />
                                <Picker.Item label="ml" value="ml" color="#000" />
                                <Picker.Item label="l" value="l" color="#000" />
                                <Picker.Item label="tsp" value="tsp" color="#000" />
                                <Picker.Item label="tbsp" value="tbsp" color="#000" />
                                <Picker.Item label="cup" value="cup" color="#000" />
                                <Picker.Item label="piece" value="piece" color="#000" /> {/* instead of "pcs" */}
                            </Picker>
                        </View>



                        {/* Ingredient name */}
                        <TextInput
                            sx={{
                                flex: 1,
                                bg: "white",
                                borderRadius: "s",
                                p: "s",
                                textAlign: "left",
                            }}
                            placeholder="Name"
                            value={item.name}
                            onChangeText={(text) => handleIngredientChange(index, "name", text)}
                        />

                        {/* 🗑️ Remove Button */}
                        <Pressable onPress={() => handleRemoveIngredient(index)}>
                            <Ionicons name="trash" size={20} color="red" />
                        </Pressable>
                    </View>
                ))}


                {/* ➕ Add Ingredient */}
                <Pressable onPress={handleAddIngredient}>
                    <View
                        sx={{
                            bg: "$primary",
                            p: "s",
                            borderRadius: "m",
                            alignItems: "center",
                            justifyContent: "center",
                            mt: "s",
                        }}
                    >
                        <Text sx={{ color: "white", fontWeight: "bold" }}>+ Add Ingredient</Text>
                    </View>
                </Pressable>

                {/* ✍️ Instructions */}
                <Text sx={{ fontWeight: "bold", mt: "m", mb: "s" }}>Instructions</Text>
                <TextInput
                    sx={{
                        bg: "$muted",
                        mb: "s",
                        p: "s",
                        borderRadius: "m",
                        minHeight: 100,
                        textAlignVertical: "top",
                    }}
                    placeholder="Instructions"
                    multiline
                    value={instructions}
                    onChangeText={setInstructions}
                />
                {/* 💾 Save Changes */}
                <Pressable onPress={handleUpdateRecipe}>
                    <View
                        sx={{
                            bg: "$primary",
                            p: "m",
                            borderRadius: "m",
                            alignItems: "center",
                            mt: "m",
                        }}
                    >
                        <Text sx={{ color: "white", fontWeight: "bold" }}>Save Changes</Text>
                    </View>
                </Pressable>
            </View>
        </ScrollView>
    );
}
