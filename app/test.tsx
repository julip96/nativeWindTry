import { useEffect, useRef, useState } from 'react';

import { Picker } from "@react-native-picker/picker";

import { Animated, Platform } from 'react-native';

import { useRouter } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { ScrollView, Text, TextInput, View } from 'dripsy';

import Box from '../components/Box';

import Button from '../components/Button';

import UserInput from '@/components/UserInput';

export default function Test() {

    const [isFocused, setIsFocused] = useState(false);

    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const [values, setValues] = useState({
        underline: '',
        boxed: '',
        animated: '',
        floating: '',
        glow: '',
        design1: '',
        design2: '',
        design3: '',
        design4: '',
    });

    const validateName = (text: string) => {
        if (!text || text.trim().length === 0) return 'Name darf nicht leer sein';
        if (text.length < 3) return 'Name muss mindestens 3 Zeichen lang sein';
        return true;
    };

    const validateAmount = (text: string) => {
        if (!text || text.trim().length === 0) return 'Amount darf nicht leer sein';

        // Prüfen, ob nur Zahlen (0-9) eingegeben wurden
        const numberOnlyRegex = /^[0-9]+$/;
        if (!numberOnlyRegex.test(text)) return 'Bitte nur Zahlen eingeben';

        if (text.length < 1) return 'Amount muss mindestens 1 Zeichen lang sein';

        return true;
    };


    const [name, setName] = useState('');

    const handleChange = (key: string, text: string) => {
        setValues(v => ({ ...v, [key]: text }));
    };

    const [ingredientName, setIngredientName] = useState('');

    const [ingredientAmount, setIngredientAmount] = useState('');

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




            <Box>
                <UserInput
                    label="Name"
                    placeholder="Type in ingredient name here"
                    value={ingredientName}
                    onChangeText={setIngredientName}
                    validate={validateName}
                />
                <UserInput
                    label="Amount"
                    placeholder="Type in amount here"
                    value={ingredientAmount}
                    onChangeText={setIngredientAmount}
                    validate={validateAmount}
                />

                <Picker
                    selectedValue={selectedUnit}
                    onValueChange={(val) => {
                        //     handleIngredientChange(index, "unit", val);
                        setIsFocused(false);
                        setSelectedUnit(val)
                    }}
                    itemStyle={{ color: "black" }}
                    style={{
                        width: Platform.select({ ios: '100%', android: '100%' }),


                    }}
                >
                    {units.map((u) => (
                        <Picker.Item key={u} label={u} value={u} />
                    ))}

                </Picker>

            </Box>



            <Box><Text>{ingredientAmount} {selectedUnit} of {ingredientName}  </Text></Box>
            <View>
                <Button title="Go to settings" onPress={() => router.push('/settings')} color="$secondary" />
            </View>


            <StatusBar style="dark" />

        </ScrollView>

    )
}