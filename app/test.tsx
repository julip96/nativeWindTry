import { useEffect, useRef, useState } from 'react';

import { Picker } from "@react-native-picker/picker";

import { Animated, Platform } from 'react-native';

import { useRouter } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { ScrollView, Text, TextInput, View } from 'dripsy';

import Box from '../components/Box';

import Button from '../components/Button';

export default function Test() {

    const [isFocused, setIsFocused] = useState(false);

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


    const bc = "white"
    const [text, setText] = useState('')

    // function for testing textinput style
    const borderAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(borderAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);
    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', '#007AFF'],
    });

    const showLabel = isFocused || text.length > 0;

    return (

        <ScrollView sx={{ bg: '$background' }}>





            {/* build boxes that look nice. When finish create component */}

            <Box><Text variant='heading'>Schatten</Text></Box>
            <Box><Text variant='heading'>Schatten</Text></Box>
            <Box><Text variant='heading'>Schatten</Text></Box>


            <Box><Text variant='heading'>Test</Text></Box>

            <Box>           <TextInput
                placeholder="Type in name here"
                placeholderTextColor="#999"
                value={text}
                onChangeText={setText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                    borderWidth: 2,
                    borderColor: isFocused ? '#007AFF' : '#ccc', // Blau beim Fokus
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 16,
                    color: '#000',
                    // Schatten nur beim Fokus
                    shadowColor: isFocused ? '#007AFF' : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isFocused ? 0.3 : 0,
                    shadowRadius: 4,
                    elevation: isFocused ? 3 : 0,
                }}
            />
            </Box>

            <Box>

                <TextInput
                    placeholder="Type in name here"
                    placeholderTextColor="#999"
                    value={text}
                    onChangeText={setText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: isFocused ? '#007AFF' : '#ccc',
                        paddingVertical: 8,
                        fontSize: 16,
                        color: '#000',
                    }}
                />
            </Box>



            <Box>
                <Animated.View
                    style={{
                        borderWidth: 2,
                        borderRadius: 12,
                        borderColor,
                    }}
                >
                    <TextInput
                        placeholder="Type in name here"
                        placeholderTextColor="#999"
                        value={text}
                        onChangeText={setText}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{
                            padding: 12,
                            fontSize: 16,
                            color: '#000',
                        }}
                    />
                </Animated.View>
            </Box>

            <Box>
                <View
                    style={{
                        borderWidth: 2,
                        borderColor: isFocused ? '#007AFF' : '#ccc',
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingTop: 18,
                        paddingBottom: 8,
                        position: 'relative',
                    }}
                >
                    {showLabel && (
                        <Text
                            style={{
                                position: 'absolute',
                                left: 12,
                                top: 6,
                                fontSize: 12,
                                color: isFocused ? '#007AFF' : '#999',
                            }}
                        >
                            Name
                        </Text>
                    )}
                    <TextInput
                        placeholder={showLabel ? '' : 'Name'}
                        placeholderTextColor="#999"
                        value={text}
                        onChangeText={setText}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{
                            fontSize: 16,
                            color: '#000',
                            padding: 0,
                            margin: 0,
                        }}
                    />
                </View>

            </Box>

            <Box flexDir='column'>

                <Text>___________________________________</Text>
                {/* User input for a new ingredient */}

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
                    onValueChange={(val) => {
                        //     handleIngredientChange(index, "unit", val);
                        setIsFocused(false);
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