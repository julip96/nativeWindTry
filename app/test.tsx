import { useState } from 'react';

import { Alert } from 'react-native';

import { Picker } from "@react-native-picker/picker";


import { useLocalSearchParams, useRouter } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { ScrollView, Text, TextInput, View } from 'dripsy';

import Box from '../components/Box';

import Button from '../components/Button';

import { supabase } from '@/utils/supabase';

export default function Test() {

    // I will paste functionality from newrecipe screen here
    const { book_id } = useLocalSearchParams(); // optional vorgegebene Kochbuch-ID

    const [userId, setUserId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [instructions, setInstructions] = useState("");
    const [image, setImage] = useState<string | null>(null);

    // Kochbücher
    const [books, setBooks] = useState<{ id: string; name: string }[]>([]);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);


    const handleFocus = (field: string) => {
        setFocusedField(field);
    };

    const clearFocus = () => {
        setFocusedField(null);
    };



    // 💾 Save Recipe
    const handleSaveRecipe = async () => {
        if (!userId || !selectedBookId)
            return Alert.alert("Error", "Missing user or cookbook");

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


    const [focusedField, setFocusedField] = useState<string | null>(null);

    const [ingredientName, setIngredientName] = useState("banana");

    const [ingredientAmount, setIngredientAmount] = useState("0");

    const units = ["-", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "pcs"];

    const [selectedUnit, setSelectedUnit] = useState("-")

    const [ingredients, setIngredients] = useState<
        { amount: string; unit: string; name: string }[]
    >([{ amount: "", unit: "g", name: "" }]);

    const handleAddIngredientRow = () => {
        setIngredients([...ingredients, { amount: "", unit: "g", name: "" }]);
    };

    const handleIngredientChange = (
        index: number,
        field: "amount" | "unit" | "name",
        value: string,
    ) => {
        const updated = [...ingredients];
        updated[index][field] = value;
        setIngredients(updated);
    }

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    ;

    const router = useRouter();

    const inputStyle = (field: string) => ({
        borderColor: focusedField === field ? "$secondary" : "$primary",
    })

    const bc = "white"

    return (

        <ScrollView sx={{ bg: '$background' }}>


            <Box>
                <Text sx={{}}>Ingredients</Text>

                {/* has shadow */}
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
                            boxShadow: "md",
                        }}
                    >
                        <View sx={{ flexDirection: "row", alignItems: "center" }}>
                            <TextInput
                                sx={{
                                    ...inputStyle(`amt-${index}`),
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
                                    ...inputStyle(`unit-${index}`),
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
                                    itemStyle={{ color: "black" }}
                                >
                                    {units.map((u) => (
                                        <Picker.Item key={u} label={u} value={u} />
                                    ))}
                                </Picker>
                            </View>

                            <TextInput
                                sx={{
                                    ...inputStyle(`name-${index}`),
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

                            <Button title='remove' onPress={handleRemoveIngredient} color='red' />
                        </View>
                    </View>
                ))}

                <Button title='+ Add ingredient' onPress={handleAddIngredientRow()} color='green' />

            </Box>


            {/* build boxes that look nice. When finish create component */}

            <Box><Text variant='heading'>Schatten</Text></Box>
            <Box><Text variant='heading'>Schatten</Text></Box>
            <Box><Text variant='heading'>Schatten</Text></Box>


            <Box><Text variant='heading'>Test</Text></Box>
            <Box flexDir='row'>

                <View sx={{ flexDirection: 'column', flex: 1, p: 's' }}>
                    <Text>Amount</Text>
                    <TextInput placeholder='Type in amount here...' sx={{
                        flex: 1, borderColor: '$primary', borderRadius: 5, borderWidth: 5
                    }} />
                </View>

                <View sx={{ flexDirection: 'column', flex: 2, p: 's' }}>
                    <Text>Unit</Text>
                    <Picker
                        selectedValue={selectedUnit}
                        //  onFocus={() => handleFocus(`unit-${index}`)}
                        onValueChange={(val) => {
                            //     handleIngredientChange(index, "unit", val);
                            setFocusedField(null);
                            setSelectedUnit(val)
                        }}
                        itemStyle={{ color: "black" }}
                        style={{
                            // width: Platform.select({ ios: '20%', android: '20%' }),
                            flex: 1
                            , width: '50%'
                        }}
                    >
                        {units.map((u) => (
                            <Picker.Item key={u} label={u} value={u} />
                        ))}

                    </Picker>
                </View>
                <View sx={{ flexDirection: 'column', flex: 1, p: 's' }}>
                    <Text>Name</Text>
                    {/* Ingredient name and amount */}
                    <TextInput placeholder='Type in ingredient name here...' sx={{
                        flex: 1, borderColor: '$primary', borderRadius: 5, borderWidth: 5
                    }} />
                </View>

            </Box>

            <Box><Text>{ingredientAmount} {selectedUnit} of {ingredientName}  </Text></Box>
            <View>
                <Button title="Go to settings" onPress={() => router.push('/settings')} color="$secondary" />
            </View>


            <StatusBar style="dark" />

        </ScrollView>

    )
}