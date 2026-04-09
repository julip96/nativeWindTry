import type { ScrollView as ScrollViewType } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Pressable, ScrollView, Text, TextInput, View } from "dripsy";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Image } from "react-native";
import { supabase } from "../../utils/supabase";
import Box from "@/components/Box";
import UserInput from "@/components/UserInput";
import Button from "@/components/Button";
import PhotoPickerBox from '@/components/PhotoPickerBox';
import * as ImagePicker from "expo-image-picker";

export default function NewRecipe() {
  const { book_id } = useLocalSearchParams(); // optional vorgegebene Kochbuch-ID
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [focusedField, setFocusedField] = useState<string | null>(null);
  // Kochbücher
  const [books, setBooks] = useState<{ id: string; name: string }[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Zutaten
  const [ingredients, setIngredients] = useState<
    { amount: string; unit: string; name: string }[]
  >([{ amount: "", unit: "g", name: "" }]);

  const units = ["-", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "pcs"];

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  const clearFocus = () => {
    setFocusedField(null);
  };

  // 👤 Lade User und Kochbücher
  useEffect(() => {
    const fetchUserAndBooks = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
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

      // falls ein book_id übergeben wurde, sicherstellen dass es existiert
      if (book_id && booksData?.some((b) => b.id === book_id)) {
        setSelectedBookId(book_id as string);
      }
    };

    fetchUserAndBooks();
  }, []);

  // 🧾 Zutatenzeilen-Funktionen
  const handleIngredientChange = (
    index: number,
    field: "amount" | "unit" | "name",
    value: string,
  ) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleAddIngredientRow = () => {
    setIngredients([...ingredients, { amount: "", unit: "g", name: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
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



  const validateName = (text: string) => {
    if (!text || text.trim().length === 0) return 'Name darf nicht leer sein';
    if (text.length < 3) return 'Name muss mindestens 3 Zeichen lang sein';
    return true;
  };

  const validateInstructions = (text: string) => {
    if (!text || text.trim().length === 0) return 'Instructions darf nicht leer sein';
    if (text.length < 3) return 'Instructions muss mindestens 3 Zeichen lang sein';
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

  async function handlePickImage() {
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
  }

  async function handleTakePhoto() {
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
  }

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
              setFocusedField(null);
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
              {/* 📸 Bildpicker Buttons */}
              <Box>
                {!image && (
                  <View sx={{ flexDirection: "row", justifyContent: "space-between", mb: "m" }}>

                    <Button title="From Gallery" onPress={handlePickImage} color="$secondary" />
                    <Button title="Take Photo" onPress={handleTakePhoto} color="$primary" />
                  </View>
                )}

                {/* 🖼 Bildanzeige – IDENTISCH zu NewRecipe */}
                {image && (


                  <PhotoPickerBox onChange={setImage} uri={image} />
                )}
              </Box>

              {/* Cookbook */}
              <Text variant="heading">Cookbook</Text>

              <Picker
                // changed from {selectedBookId}
                selectedValue={selectedBookId ? selectedBookId : null}
                onFocus={() => handleFocus("book")}
                onValueChange={(val) => {
                  setSelectedBookId(val);
                  setFocusedField(null);
                }}
                style={{
                  height: 200,
                  width: 300

                }}
                itemStyle={{ color: "black" }}
              >
                <Picker.Item label="No specific cookbook" value={null} style={{ height: 200 }} />
                {books.map((b) => (
                  <Picker.Item key={b.id} label={b.name} value={b.id} />
                ))}
              </Picker>


              {/* 🧂 Zutaten */}
              <Text variant="heading">Ingredients</Text>

              {/* has shadow */}
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



                  <Pressable
                    onPress={() => handleRemoveIngredient(index)}
                    sx={{ m: "s", alignSelf: "flex-end" }}

                  >
                    <Ionicons name="trash" size={22} color="red" />
                  </Pressable>

                </Box>
              ))}

              <Button title="+ Add Ingredient" onPress={handleAddIngredientRow} color="$primary" />

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



              {/* Save */}

              <Button title="Save Recipe" onPress={handleSaveRecipe} color="$accent" />

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
              setFocusedField(null);
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
                  onFocus={() => handleFocus("book")}
                  onValueChange={(val) => {
                    setSelectedBookId(val);
                    setFocusedField(null);
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
                      onFocus={() => handleFocus(`amt-${index}`)}
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
                        onFocus={() => handleFocus(`unit-${index}`)}
                        onValueChange={(val) => {
                          handleIngredientChange(index, "unit", val);
                          setFocusedField(null);
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
                      onFocus={() => handleFocus(`name-${index}`)}
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
