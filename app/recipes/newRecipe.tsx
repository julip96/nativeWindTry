import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ScrollView as ScrollViewType } from 'react-native';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Pressable, ScrollView, Text, TextInput, View } from "dripsy";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { supabase } from "@/utils/supabase";
import Box from "@/components/Box";
import UserInput from "@/components/UserInput";
import Button from "@/components/Button";
import PhotoPickerBox from '@/components/PhotoPickerBox';

export default function NewRecipe() {

  const router = useRouter();

  // loading states
  const [savingRecipe, setSavingRecipe] = useState(false);

  // optional given cookbook-ID
  const { book_id } = useLocalSearchParams();

  // Cookbooks
  const [books, setBooks] = useState<{ id: string; name: string }[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // Ingredients
  const [ingredients, setIngredients] = useState<
    { amount: string; unit: string; name: string }[]
  >([{ amount: "", unit: "g", name: "" }]);
  const units = ["-", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "pcs"];

  // 👤 Lade User und Kochbücher
  useEffect(() => {

    const fetchUserAndBooks = async () => {

      try {

        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {

          console.error("Error fetching user:", userError);
          return;

        }

        setUserId(userData.user.id);

        const { data: booksData, error: booksError } = await supabase
          .from("recipe_books")
          .select("*")
          .eq("owner_id", userData.user.id)
          .order("name");

        if (booksError) console.error("Error fetching cookbooks:", booksError);
        else setBooks(booksData || []);

        // check if id exists and belongs to user, then set as selected
        if (book_id && typeof book_id === "string" && booksData?.some((b) => b.id === book_id)) {
          setSelectedBookId(book_id as string);
        }

      } finally {

      }

    };

    fetchUserAndBooks();

  }, []);

  // 🧾 Zutatenzeilen-Funktionen
  const handleIngredientChange = useCallback(
    (
      index: number,
      field: "amount" | "unit" | "name",
      value: string,
    ) => {
      setIngredients((prev) => {
        const updated = [...prev];
        updated[index][field] = value;
        return updated;
        //const updated = [...ingredients];
        //updated[index][field] = value;
        //setIngredients(updated);
      });
    }, []);

  const handleAddIngredientRow = useCallback(() => {
    setIngredients((prev) => [...prev, { amount: "", unit: "g", name: "" }]);
  }, []);

  const handleRemoveIngredient = useCallback((index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Save Recipe
  const handleSaveRecipe = async () => {

    if (!userId || !selectedBookId) {

      return Alert.alert("Error", "Missing user or cookbook");

    }

    // validate ingredients
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
    } finally {
      setSavingRecipe(false);
    }
  };

  const validateName = (text: string) => {
    if (!text || text.trim().length === 0) return 'Name cannot be empty';
    if (text.length < 3) return 'Name must be at least 3 characters long';
    return true;
  };

  const validateInstructions = (text: string) => {
    if (!text || text.trim().length === 0) return 'Instructions cannot be empty';
    if (text.length < 3) return 'Instructions must be at least 3 characters long';
    return true;
  };

  const validateAmount = (text: string) => {
    if (!text || text.trim().length === 0) return 'Amount cannot be empty';

    // Check if only numbers (0-9) and optionally a decimal point were entered
    const numberOnlyRegex = /^[0-9]*\.?[0-9]+$/;
    if (!numberOnlyRegex.test(text)) return 'Please enter only numbers';

    if (text.length < 1) return 'Amount must be at least 1 character long';

    return true;
  };

  const handlePickImage = useCallback(async () => {
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
  }, []);

  const handleTakePhoto = useCallback(async () => {
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
  }, []);

  const scrollViewRef = useRef<ScrollViewType | null>(null);

  if (Platform.OS === "ios") {
    return (

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // je nach Header-Höhe anpassen
      >

        <ScrollView sx={{ p: "m", bg: "$background", flex: 1, }} keyboardShouldPersistTaps="handled">

          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
            }}
          >

            <View>

              <Text variant="heading">Recipe Title</Text>

              <UserInput
                label="Title"
                placeholder="e.g. Creamy Mushroom Pasta"
                value={title}
                onChangeText={setTitle}
                validate={validateName}
              />

              <Text variant="heading">Image</Text>

              {/* Show image if exists, otherwise show image picker buttons */}
              <Box>
                {!image && (
                  <View sx={{ flexDirection: "row", justifyContent: "space-between", mb: "m" }}>

                    <Button title="From Gallery" onPress={handlePickImage} color="$secondary" />
                    <Button title="Take Photo" onPress={handleTakePhoto} color="$primary" />
                  </View>
                )}

                {image && (

                  <PhotoPickerBox onChange={setImage} uri={image} />
                )}
              </Box>

              {/* Cookbook */}
              <Text variant="heading">Cookbook</Text>

              <Box>

                <Picker
                  selectedValue={selectedBookId ? selectedBookId : null}
                  onValueChange={(val) => {
                    setSelectedBookId(val);
                  }}
                  style={{
                    height: 200,
                    width: 300,

                  }}
                  itemStyle={{ color: "black" }}
                >

                  <Picker.Item label="No specific cookbook" value={null} style={{ height: 200 }} />
                  {books.map((b) => (
                    <Picker.Item key={b.id} label={b.name} value={b.id} />
                  ))}

                </Picker>

              </Box>

              {/* Map all existing ingredients for this recipe and input fields to change its values */}
              <Text variant="heading">Ingredients</Text>

              {ingredients.map((item, index) => (
                <Box key={index} flexDir="column">

                  <UserInput
                    label="Name"
                    placeholder="Type in ingredient name here"
                    value={item.name}
                    onChangeText={(text) =>
                      handleIngredientChange(index, "name", text)
                    }
                    validate={validateName}
                  />

                  <UserInput
                    label="Amount"
                    placeholder="Type in amount here"
                    value={item.amount}
                    onChangeText={(text) =>
                      handleIngredientChange(index, "amount", text)
                    }
                    validate={validateAmount}
                  />

                  <Picker
                    selectedValue={item.unit}
                    onValueChange={(val) => {
                      handleIngredientChange(index, "unit", val);
                    }}
                    itemStyle={{ color: "black" }}
                  >
                    {units.map((u) => (
                      <Picker.Item key={u} label={u} value={u} />
                    ))}
                  </Picker>

                  <Pressable
                    onPress={() => handleRemoveIngredient(index)}
                    sx={{ m: "s", alignSelf: "flex-end" }}

                  >
                    <Ionicons name="trash" size={22} color="red" />
                  </Pressable>

                </Box>
              ))}

              {/* Add another ingredient */}
              <Button title="+ Add Ingredient" onPress={handleAddIngredientRow} color="$primary" />

              {/* Add instructions */}
              <Text variant="heading">Instructions</Text>

              <UserInput
                label="Instructions"
                placeholder="Step-by-step Instructions"
                value={instructions}
                onChangeText={setInstructions}
                validate={validateInstructions}
                multiline
                onFocus={() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }}
              />

              {/* Save recipe*/}
              <Button
                title={savingRecipe ? "Saving..." : "Save Recipe"}
                onPress={handleSaveRecipe}
                disabled={savingRecipe}
                color="$accent"
              />

            </View>

          </TouchableWithoutFeedback>

        </ScrollView>

      </KeyboardAvoidingView>

    );

  } else {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="height"
        keyboardVerticalOffset={0} // je nach Header-Höhe anpassen
      >
        <ScrollView sx={{ p: "m", bg: "$background", flex: 1, }} keyboardShouldPersistTaps="handled">
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View>
              <Text variant="heading" sx={{ mb: "m" }}>
                New Recipe
              </Text>

              <Text variant="heading">Recipe Title</Text>
              <Box>
                <UserInput
                  label="Title"
                  placeholder="e.g. Creamy Mushroom Pasta"
                  value={title}
                  onChangeText={setTitle}
                  validate={validateName}
                />
              </Box>
              <Text variant="heading">Image</Text>
              {/* 📸 Bildpicker Buttons */}
              <Box>
                {!image && (
                  <View sx={{ flexDirection: "row", justifyContent: "space-between", mb: image ? "m" : "none" }}>
                    <Pressable onPress={handlePickImage}>
                      <View
                        sx={{
                          bg: "$secondary",
                          p: "m",
                          borderRadius: "m",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 150,
                        }}
                      >
                        <Text sx={{ color: "white", fontWeight: "bold" }}>From Gallery</Text>
                      </View>
                    </Pressable>

                    <Pressable onPress={handleTakePhoto}>
                      <View
                        sx={{
                          bg: "$primary",
                          p: "m",
                          borderRadius: "m",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 150,
                        }}
                      >
                        <Text sx={{ color: "white", fontWeight: "bold" }}>Take Photo</Text>
                      </View>
                    </Pressable>
                  </View>
                )}
                {/* 🖼 Bildanzeige – IDENTISCH zu NewRecipe */}
                {image && (
                  <PhotoPickerBox onChange={setImage} uri={image} />
                )}
              </Box>
              {/* Cookbook */}
              <Text variant="heading">Cookbook</Text>
              <Box>
                <Picker
                  selectedValue={selectedBookId}
                  onValueChange={(val) => {
                    setSelectedBookId(val);
                  }}
                >
                  <Picker.Item label="Select a cookbook" value={null} />
                  {books.map((b) => (
                    <Picker.Item key={b.id} label={b.name} value={b.id} />
                  ))}
                </Picker>
              </Box>

              {/* 🧂 Zutaten */}
              <Text variant='heading'>Ingredients</Text>
              {ingredients.map((item, index) => (
                <Box
                  key={index}
                >
                  <View sx={{ flexDirection: "row", alignItems: "center" }}>
                    <TextInput
                      sx={{
                        width: 70,
                        mr: "s",
                        textAlign: "center",
                        height: "90%",
                      }}
                      placeholder="Amt"
                      value={item.amount}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        handleIngredientChange(index, "amount", text)
                      }
                    />

                    <View
                      sx={{
                        width: 120,
                        height: "90%",
                        mr: "s",
                        p: 1,
                      }}
                    >
                      <Picker
                        selectedValue={item.unit}
                        onValueChange={(val) => {
                          handleIngredientChange(index, "unit", val);
                        }}
                      >
                        {units.map((u) => (
                          <Picker.Item key={u} label={u} value={u} />
                        ))}
                      </Picker>
                    </View>

                    <TextInput
                      sx={{
                        flex: 1,
                        height: "90%",
                      }}
                      placeholder="Ingredient Name"
                      value={item.name}
                      onChangeText={(text) =>
                        handleIngredientChange(index, "name", text)
                      }
                    />

                    <Pressable
                      onPress={() => handleRemoveIngredient(index)}
                      sx={{ m: "s" }}
                    >
                      <Ionicons name="trash" size={22} color="red" />
                    </Pressable>
                  </View>
                </Box>
              ))}



              <Button title="+ Add Ingredient" onPress={handleAddIngredientRow} color="$primary" />

              {/* Instructions */}
              <Text variant="heading">Instructions</Text>
              <Box flexDir="column">
                <UserInput
                  label="Instructions"
                  placeholder="Step-by-step Instructions"
                  value={instructions}
                  onChangeText={setInstructions}
                  validate={validateInstructions}
                  multiline
                  onFocus={() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }}
                />

              </Box>

              {/* Save */}

              <Button title="Save Recipe" onPress={handleSaveRecipe} color="$accent" />

            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}
