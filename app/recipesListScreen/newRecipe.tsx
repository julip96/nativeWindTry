import React from "react";
import { View, Text, TextInput } from "dripsy";
import { Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as SQLite from 'expo-sqlite';


export default function NewRecipe() {



    const [recipe, setRecipe] = React.useState({
        id: '',
        title: '',
        description: ''
    });

    const [savedRecipes, setSavedRecipes] = React.useState([]);

    function handleTitleChange(text: string) {
        setRecipe({
            ...recipe,
            title: text
        });
    }

    function handleDescriptionChange(text: string) {
        setRecipe({
            ...recipe,
            description: text
        });
    }

    const getData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('my-key');
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            // error reading value
        }
    };

    // Save recipe to AsyncStorage
    async function handleSaveRecipe(recipe) {

        try {

            const newRecipe = {
                ...recipe,
                id: Date.now().toString()
            }

            const jsonValue = JSON.stringify(newRecipe);
            await AsyncStorage.setItem(`recipe-${newRecipe.id}`, jsonValue);

            console.log('Recipe saved:', newRecipe);

        } catch (e) {

            console.error('Error saving recipe:', e);

        }

    }

    // Testing purposes
    async function handleLoadRecipe() {
        try {

            const keys = await AsyncStorage.getAllKeys();
            const recipeKeys = keys.filter(key => key.startsWith('recipe-'));

            const items = await AsyncStorage.multiGet(recipeKeys);

            const loadedRecipes = items.map(([key, value]) => JSON.parse(value!));

            setSavedRecipes(loadedRecipes);

        } catch (e) {

            console.error('Error loading recipe:', e);

        }
    }


    return (
        <View>
            <Text variant="heading" sx={{ mb: 'm' }}>New Recipe Screen</Text>

            <TextInput sx={{ bg: "$background" }} placeholder="Recipe Title"
                value={recipe.title}
                onChangeText={handleTitleChange}
            />
            <TextInput sx={{ bg: "$background" }} placeholder="Recipe Description"
                value={recipe.description}
                onChangeText={handleDescriptionChange}
            />
            {/* Activate these when saving a recipe from here works
            <TextInput sx={{ bg: "$background" }} placeholder="Ingredients" />
            <TextInput sx={{ bg: "$background" }} placeholder="Time" />
*/}
            <Pressable
                android_ripple={{ color: '#ccc' }}
                onPress={() =>

                    handleSaveRecipe(recipe)

                }
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
                <View sx={{
                    bg: '$primary',
                    p: 'm',
                    borderRadius: 'm',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 's',
                }}>
                    <Text sx={{ color: 'white', fontWeight: 'bold' }}>Add recipe</Text>
                </View>
            </Pressable>

            <Pressable
                android_ripple={{ color: '#ccc' }}
                onPress={handleLoadRecipe}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
                <View sx={{
                    bg: '$secondary',
                    p: 'm',
                    borderRadius: 'm',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 's',
                }}>
                    <Text sx={{ color: 'white', fontWeight: 'bold' }}>Load recipe</Text>
                </View>
            </Pressable>

            {/* Display all loaded recipes */}
            {savedRecipes.length > 0 && (
                <View sx={{ mt: "m" }}>
                    <Text variant="heading">Loaded Recipes:</Text>
                    {savedRecipes.map((r) => (
                        <View key={r.id} sx={{ mt: "s" }}>
                            <Text>ID: {r.id}</Text>
                            <Text>Title: {r.title}</Text>
                            <Text>Description: {r.description}</Text>
                        </View>
                    ))}
                </View>
            )}


        </View >
    )
}               