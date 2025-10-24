import React from "react";
import { View, Text, TextInput, ScrollView, Image, Alert } from "dripsy";
import { Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

type Recipe = {
    id: string;
    title: string;
    ingredients: string;
    instructions: string;
    image: string;
};

export default function NewRecipe() {
    const [recipe, setRecipe] = React.useState<Recipe>({
        id: "",
        title: "",
        ingredients: "",
        instructions: "",
        image: "",
    });

    const [savedRecipes, setSavedRecipes] = React.useState<Recipe[]>([]);

    function handleChange(key: keyof Recipe, value: string) {
        setRecipe((prev) => ({ ...prev, [key]: value }));
    }

    // 📷 Pick image from gallery
    async function handlePickImage() {
        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Permission required", "We need access to your photos!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: [ImagePicker.MediaType.Image], // ✅ new syntax
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
            mediaTypes: [ImagePicker.MediaType.Image], // ✅ new syntax
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            handleChange("image", result.assets[0].uri);
        }
    }

    // 💾 Save recipe
    async function handleSaveRecipe(recipe: Recipe) {
        try {
            const newRecipe = {
                ...recipe,
                id: Date.now().toString(),
            };

            const jsonValue = JSON.stringify(newRecipe);
            await AsyncStorage.setItem(`recipe-${newRecipe.id}`, jsonValue);

            console.log("Recipe saved:", newRecipe);
            setRecipe({
                id: "",
                title: "",
                ingredients: "",
                instructions: "",
                image: "",
            });
            Alert.alert("Success", "Recipe saved!");
        } catch (e) {
            console.error("Error saving recipe:", e);
        }
    }

    // 📥 Load saved recipes
    async function handleLoadRecipe() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const recipeKeys = keys.filter((key) => key.startsWith("recipe-"));
            const items = await AsyncStorage.multiGet(recipeKeys);
            const loadedRecipes: Recipe[] = items.map(([key, value]) =>
                JSON.parse(value!)
            );
            setSavedRecipes(loadedRecipes);
        } catch (e) {
            console.error("Error loading recipe:", e);
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
                    onPress={() => handleSaveRecipe(recipe)}
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
                        <Text sx={{ color: "white", fontWeight: "bold" }}>Add recipe</Text>
                    </View>
                </Pressable>

                {/* 📥 Load */}
                <Pressable
                    android_ripple={{ color: "#ccc" }}
                    onPress={handleLoadRecipe}
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
                        }}
                    >
                        <Text sx={{ color: "white", fontWeight: "bold" }}>Load recipes</Text>
                    </View>
                </Pressable>

                {/* 🧾 Display loaded recipes */}
                {savedRecipes.length > 0 && (
                    <View sx={{ mt: "m" }}>
                        <Text variant="heading">Loaded Recipes:</Text>
                        {savedRecipes.map((r) => (
                            <View key={r.id} sx={{ mt: "s" }}>
                                <Text>Title: {r.title}</Text>
                                {r.image ? (
                                    <Image
                                        source={{ uri: r.image }}
                                        style={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 8,
                                            marginTop: 4,
                                            resizeMode: "cover",
                                        }}
                                    />
                                ) : null}
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
