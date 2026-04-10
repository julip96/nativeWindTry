import { useEffect, useRef, useState } from 'react';

import { Alert } from 'react-native';

import { Picker } from "@react-native-picker/picker";

import { Animated, Platform } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { ScrollView, Text, TextInput, View } from 'dripsy';

import Box from '../components/Box';

import Button from '../components/Button';

import UserInput from '@/components/UserInput';

import { supabase } from '@/utils/supabase';

export default function Test() {


    const [loading, setLoading] = useState(false)

    const [isFocused, setIsFocused] = useState(false);

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

    const [ingredientName, setIngredientName] = useState('');

    const [ingredientAmount, setIngredientAmount] = useState('');

    const units = ["-", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "pcs"];

    const [selectedUnit, setSelectedUnit] = useState("-")

    const [ingredients, setIngredients] = useState<
        { amount: string; unit: string; name: string }[]
    >([{ amount: "", unit: "g", name: "" }]);

    const router = useRouter();

    // function for testing textinput style
    const borderAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(borderAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    return (

        <ScrollView sx={{ bg: '$background' }}>






            <Box flexDir='column'>
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
