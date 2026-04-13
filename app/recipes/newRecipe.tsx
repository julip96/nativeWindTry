import React, { useCallback, useEffect, useRef, useState } from "react";

import type { ScrollView as ScrollViewType } from 'react-native';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { decode } from "base64-arraybuffer";

import { Pressable, ScrollView, Text, TextInput, View } from "dripsy";

import { supabase } from "@/utils/supabase";
import Box from "@/components/Box";
import UserInput from "@/components/UserInput";
import Button from "@/components/Button";
import PhotoPickerBox from '@/components/PhotoPickerBox';
import { useSession } from "@/components/SessionProvider";
import { uploadRecipeImagePrivateBucketSupabase } from "../functions/uploadRecipeImagePrivateBucketSupabase";

export default function NewRecipe() {

  const router = useRouter();

  // get user id
  const { session } = useSession();
  const userId = session?.user.id;

  // loading states
  const [savingRecipe, setSavingRecipe] = useState(false);

  // optional given cookbook-ID
  const { book_id } = useLocalSearchParams();

  // Cookbooks
  const [books, setBooks] = useState<{ id: string; name: string }[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Ingredients
  const [ingredients, setIngredients] = useState<
    { amount: string; unit: string; name: string }[]
  >([{ amount: "", unit: "g", name: "" }]);
  const units = ["-", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "pcs"];

  // Load cookbooks
  useEffect(() => {

    const fetchUserAndBooks = async () => {

      try {

        const { data: booksData, error: booksError } = await supabase
          .from("recipe_books")
          .select("*")
          .eq("owner_id", userId)
          .order("name");

        if (booksError) console.error("Error fetching cookbooks:", booksError);
        else setBooks(booksData || []);

        // check if id exists and belongs to user, then set as selected
        if (book_id && typeof book_id === "string" && booksData?.some((b) => b.id === book_id)) {
          setSelectedBookId(book_id as string);
        }

      } finally {
        // after sourcing function out it should return cookbooks
        return;
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
  // Use phone gallery to pick image and set image uri. cut in two functions to avoid too much nesting in the onPress handler of the button
  const handlePickImage = useCallback(async () => {
    if (!userId) {

      Alert.alert("Error", "No user ID found. Please log in again.");
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Permission to acces the media library is required to upload recipe images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {

      // for uploading to db
      setImageBase64(result.assets[0].base64 ?? null);
      // for saving local uri to recipe
      setImage(result.assets[0].uri);
      console.log("Image picked, URI: ", result.assets[0].uri);

    }
    console.log("Image was picked and set as image, but not yet uploaded to storage");


  }, []);

  // Use phone camera to take image and set image . cut in two functions to avoid too much nesting in the onPress handler of the button
  const handleTakePhoto = useCallback(async () => {

    if (!userId) {

      Alert.alert("Error", "No user ID found. Please log in again.");
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "We need access to your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      // for uploading to db
      setImageBase64(result.assets[0].base64 ?? null);
      // for saving local uri to recipe
      setImage(result.assets[0].uri);
      console.log("Photo taken, URI: ", result.assets[0].uri);
    }
    console.log("Photo was taken and set as image, but not yet uploaded to storage.");

  }, []);

  const loadImage = async () => {
    try {
      const { data, error } = await supabase.storage
        //.getBucket("recipe_images")


        .from("recipe_images").download(`${userId}/${image}.jpg`);

      if (error) {
        console.error("Error downloading image: ", error);
        return;
      }

      console.log("Load image data: ", data, error);
      //  console.log("Loaded image data: ", data?.id, data?.name, data?.owner);
    }
    catch (e) {
      console.error("Error downloading image: ", e);
      return;
    }
  }

  // Save Recipe
  const handleSaveRecipe = async () => {

    if (!userId || !selectedBookId) {

      return Alert.alert("Error", "Missing user or cookbook");

    }

    try {

      const imageB64 = image ? await uploadRecipeImagePrivateBucketSupabase(imageBase64 ?? "", userId) : null;

      if (!imageB64) {
        throw new Error("Failed to upload image");
      }

      const { data: recipeData, error } = await supabase
        .from("recipes")
        .insert([
          {
            user_id: userId,
            book_id: selectedBookId,
            title,
            instructions,
            local_image_url: image,
            private_bucket_image_id: imageB64,
            ingredients: JSON.stringify(ingredients),
            rating: 0,
            private: true
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



  const scrollViewRef = useRef<ScrollViewType | null>(null);

  if (Platform.OS === "ios") {
    return (

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >

        <ScrollView
          sx={{
            p: "m",
            bg: "$background",
            flex: 1,
          }}
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
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
