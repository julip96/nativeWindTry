import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, TextInput as RNTextInput, FlatList, ScrollView } from "react-native";
import { View, Text } from "dripsy";
import Entypo from "@expo/vector-icons/Entypo";
import { supabase } from "../utils/supabase"; // <-- add import

type Ingredient = {
    name: string;
    quantity?: number | null;
    unit: string;
    ingredient_id?: any;
};

export default function IngredientEditorModal({
    visible,
    index,
    initial,
    units,
    onClose,
    onSave,
}: {
    visible: boolean;
    index: number;
    initial: Ingredient;
    units: string[];
    onClose: () => void;
    onSave: (updated: Ingredient, index: number) => void;
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const inputRef = useRef<RNTextInput>(null);

    const [qty, setQty] = useState(initial?.quantity?.toString() ?? "");
    const [unit, setUnit] = useState(initial?.unit ?? "g");

    // NEW: dropdown for units
    const [unitOpen, setUnitOpen] = useState(false);

    // NEW: suggestions for name
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [nameFocused, setNameFocused] = useState(false);

    async function fetchSuggestions(text: string) {
        const { data, error } = await supabase
            .from("ingredients_catalog")
            .select("name")
            .ilike("name", `%${text}%`)
            .limit(5);

        if (error) {
            console.warn("Suggestion fetch error:", error);
            setShowSuggestions(false);
            return;
        }

        setSuggestions(data || []);
        setShowSuggestions(true);
    }

    useEffect(() => {
        if (name.trim().length > 1) {
            fetchSuggestions(name);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [name]);

    useEffect(() => {
        if (visible) {
            setName(initial?.name ?? "");
            setQty(initial?.quantity?.toString() ?? "");
            setUnit(initial?.unit ?? "g");
        }
    }, [visible]);


    // animation
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            anim.setValue(0);
            Animated.timing(anim, {
                toValue: 1,
                duration: 150,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(anim, {
                toValue: 0,
                duration: 120,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }).start();
        }
    }, [visible, anim]);

    const scale = anim.interpolate({
        inputRange: [0, 0.6, 1],
        outputRange: [0.8, 1.06, 1],
    });
    const opacity = anim;

    if (!visible) return null;

    return (
        <View
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
            }}
        >
            <Pressable
                onPress={() => {
                    onClose();
                    setUnitOpen(false);
                    setShowSuggestions(false);
                }}
                style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)" }}
            />

            <Animated.View
                style={{
                    transform: [{ scale }],
                    opacity,
                    width: "86%",
                    maxWidth: 520,
                    borderRadius: 14,
                    padding: 16,
                    backgroundColor: "#fff8e6",
                    borderWidth: 1,
                    borderColor: "#d8c3a5",
                    shadowColor: "#000",
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 12,
                }}
            >
                <View sx={{ mb: "s", alignItems: "center" }}>
                    <View style={{ height: 6 }} />
                    <Text sx={{ fontWeight: "800", fontSize: 18 }}>Edit Ingredient</Text>
                </View>

                {/* NAME + Suggestions */}
                <View sx={{ mb: "s" }}>
                    <Text sx={{ fontWeight: "600", mb: "xs" }}>Name</Text>

                    <RNTextInput
                        placeholder="Ingredient"
                        value={name}
                        onChangeText={(t) => {
                            setName(t);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setNameFocused(true)}
                        style={{
                            borderWidth: 1,
                            borderColor: "#e6d6b8",
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 10,
                            minHeight: 44,
                            backgroundColor: "white",
                        }}
                    />

                    {showSuggestions && nameFocused && suggestions.length > 0 && (
                        <View
                            style={{
                                position: "absolute",
                                top: 58, // sits directly under input
                                left: 0,
                                right: 0,
                                backgroundColor: "white",
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: "#e6d6b8",
                                zIndex: 9999,
                            }}
                        >
                            {suggestions.map((s, idx) => (
                                <Pressable
                                    key={idx}
                                    onPress={() => {
                                        setName(s.name);
                                        setShowSuggestions(false);
                                        setNameFocused(false);
                                    }}
                                    style={({ pressed }) => [{ padding: 10, opacity: pressed ? 0.6 : 1 }]}
                                >
                                    <Text>{s.name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>



                {/* QTY + UNIT */}
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                        <Text sx={{ fontWeight: "600", mb: "xs" }}>Qty</Text>
                        <RNTextInput
                            value={qty}
                            onChangeText={(t) => setQty(t.replace(/[^0-9.]/g, ""))}
                            placeholder="Amount"
                            keyboardType="numeric"
                            style={{
                                padding: 10,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: "#e6d6b8",
                                backgroundColor: "white",
                                textAlign: "center",
                            }}
                        />
                    </View>

                    {/* UNIT DROPDOWN */}
                    <View style={{ width: 120, position: "relative" }}>
                        <Text sx={{ fontWeight: "600", mb: "xs" }}>Unit</Text>

                        <Pressable
                            onPress={() => setUnitOpen((v) => !v)}
                            style={{
                                padding: 10,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: "#e6d6b8",
                                backgroundColor: "white",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Text>{unit}</Text>
                            <Entypo name="chevron-down" size={18} />
                        </Pressable>

                        {unitOpen && (
                            <View
                                style={{
                                    position: "absolute",
                                    top: 60,
                                    left: 0,
                                    right: 0,
                                    backgroundColor: "white",
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: "#e6d6b8",
                                    maxHeight: 180, // enough space for scrolling
                                    overflow: "hidden", // THIS FIXES ITEMS ESCAPING
                                    zIndex: 999999,
                                    elevation: 20,
                                    shadowColor: "#000",
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    shadowOffset: { width: 0, height: 3 },
                                }}
                            >
                                <ScrollView
                                    nestedScrollEnabled
                                    showsVerticalScrollIndicator={false}
                                >
                                    {units.map((u) => (
                                        <Pressable
                                            key={u}
                                            onPress={() => {
                                                setUnit(u);
                                                setUnitOpen(false);
                                            }}
                                            style={({ pressed }) => [
                                                {
                                                    padding: 10,
                                                },
                                                pressed && { backgroundColor: "#fff0d3" },
                                            ]}
                                        >
                                            <Text>{u}</Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                    </View>

                </View>

                {/* BUTTONS */}
                <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                    <Pressable
                        onPress={onClose}
                        style={({ pressed }) => [
                            {
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                borderRadius: 8,
                                backgroundColor: "transparent",
                                borderWidth: 1,
                                borderColor: "#d8c3a5",
                                alignItems: "center",
                                justifyContent: "center",
                            },
                            pressed && { opacity: 0.7 },
                        ]}
                    >
                        <Text style={{ color: "#6b5e4a", fontWeight: "600" }}>Cancel</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => {
                            const updated: Ingredient = {
                                name: name.trim(),
                                quantity: qty ? parseFloat(qty) : null,
                                unit: unit || "g",
                                ingredient_id: initial?.ingredient_id,
                            };
                            onSave(updated, index);
                        }}
                        style={({ pressed }) => [
                            {
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                borderRadius: 8,
                                backgroundColor: "#007bff",
                                alignItems: "center",
                                justifyContent: "center",
                            },
                            pressed && { opacity: 0.85 },
                        ]}
                    >
                        <Text style={{ color: "white", fontWeight: "700" }}>Update</Text>
                    </Pressable>
                </View>
            </Animated.View>
        </View>
    );
}