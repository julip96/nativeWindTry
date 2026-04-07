import React, { useState } from 'react'
import { Alert, AppState, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard } from 'react-native'
import { supabase } from '../utils/supabase'
import { Button as NewButton, Input } from '@rneui/themed'

import { ScrollView, View, Text } from 'dripsy'

import { StatusBar } from 'expo-status-bar'

import Button from './Button'
import UserInput from './UserInput'


// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {

    if (state === 'active') {

        supabase.auth.startAutoRefresh()

    } else {

        supabase.auth.stopAutoRefresh()

    }

})

export default function Auth() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const validateUserMail = (text: string) => {
        if (!text || text.trim().length === 0) return "Email can't be empty";

        // Regex für Email-Format: prüft z.B. auf user@domain.tld
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(text)) return "Please enter a valid email address";

        return true;
    };


    const validatePassword = (text: string) => {
        if (!text || text.trim().length === 0) return 'Password can\'t be empty';
        if (text.length < 3) return 'Password has to be at least 3 characters long';
        return true;
    };

    async function signInWithEmail() {

        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({

            email: email,
            password: password,

        })

        if (error) Alert.alert(error.message)

        setLoading(false)

    }

    async function signUpWithEmail() {

        setLoading(true)

        const {

            data: { session },
            error,

        } = await supabase.auth.signUp({

            email: email,
            password: password,

        })

        if (error) Alert.alert(error.message)

        if (!session) Alert.alert('Please check your inbox for email verification!')

        setLoading(false)

    }

    return (

        //  <KeyboardAvoidingView
        //style={{ flex: 1 }}
        // behavior={Platform.OS === "ios" ? "padding" : "height"}
        //   keyboardVerticalOffset={Platform.OS === "ios" ? 25 : 0} // je nach Header-Höhe anpassen
        // >

        <ScrollView sx={{ p: "m", bg: "$background", flex: 1, }} keyboardShouldPersistTaps="handled">
            <TouchableWithoutFeedback
                onPress={() => {
                    Keyboard.dismiss();
                }}
            >
                <View sx={{ color: 'primary' }}>

                    <Text variant="heading" >
                        EasyRecipe
                    </Text>

                    <UserInput
                        label="Email"
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="email@address.com"
                        validate={validateUserMail}
                    />

                    <UserInput
                        label="Password"
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                        placeholder="Password"
                        validate={validatePassword}
                    />

                    <Button
                        title="Sign in"
                        onPress={() => signInWithEmail()}
                        color="$primary"
                    />

                    <Button
                        title="Sign up"
                        onPress={() => signUpWithEmail()}
                        color="$secondary"
                    />

                    <StatusBar style="light" />
                </View>
            </TouchableWithoutFeedback>
        </ScrollView>
        // </KeyboardAvoidingView>
    )

}
