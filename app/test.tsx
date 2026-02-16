import { useState } from 'react';

import { Picker } from "@react-native-picker/picker";

import { Platform } from 'react-native';

import { useRouter } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { ScrollView, Text, TextInput, View } from 'dripsy';

import Box from '../components/Box';

import Button from '../components/Button';

export default function Test() {

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





            {/* build boxes that look nice. When finish create component */}

            <Box><Text variant='heading'>Schatten</Text></Box>
            <Box><Text variant='heading'>Schatten</Text></Box>
            <Box><Text variant='heading'>Schatten</Text></Box>


            <Box><Text variant='heading'>Test</Text></Box>
            <Box flexDir='column'>
                <Text>Amount</Text>
                <TextInput placeholder='Type in amount here...' sx={{
                    width: '50%', boxShadow: 'md', shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 6,
                }} />
                <Text>Select unit</Text>

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
                        width: Platform.select({ ios: '20%', android: '20%' }),
                        boxShadow: 'md',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.12,
                        shadowRadius: 6,
                        elevation: 1,

                    }}
                >
                    {units.map((u) => (
                        <Picker.Item key={u} label={u} value={u} />
                    ))}

                </Picker>
                <Text>Name</Text>
                {/* Ingredient name and amount */}
                <TextInput placeholder='Type in ingredient name here...' sx={{
                    width: '50%', shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 6, boxShadow: 'md'
                }} />

            </Box>

            <Box><Text>{ingredientAmount} {selectedUnit} of {ingredientName}  </Text></Box>
            <View>
                <Button title="Go to settings" onPress={() => router.push('/settings')} color="$secondary" />
            </View>


            <StatusBar style="dark" />

        </ScrollView>

    )
}