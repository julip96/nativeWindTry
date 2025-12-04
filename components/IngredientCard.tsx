import React from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface IngredientCardProps {
    ingredient: {
        name: string;
        quantity?: number | null;
        unit: string;
    };
    onRemove: () => void;
    onEdit: () => void;
    isEditing?: boolean,
}

export default function IngredientCard({
    ingredient,
    onRemove,
    onEdit,
    isEditing = false,
}: IngredientCardProps) {
    // Unit-based icon
    function getUnitIcon(unit: string) {
        switch (unit) {
            case "g":
            case "kg":
                return <MaterialCommunityIcons name="weight-kilogram" size={20} color="#666" />;
            case "ml":
            case "l":
                return <MaterialCommunityIcons name="cup-water" size={20} color="#666" />;
            case "tsp":
            case "tbsp":
                return <MaterialCommunityIcons name="spoon-sugar" size={20} color="#666" />;
            case "cup":
                return <MaterialCommunityIcons name="cup" size={20} color="#666" />;
            case "pcs":
                return <Ionicons name="ellipse" size={16} color="#666" />;
            default:
                return null;
        }
    }

    // Render right action (delete)
    const renderRightActions = () => (
        <Pressable
            onPress={onRemove}
            style={{
                backgroundColor: "red",
                justifyContent: "center",
                alignItems: "center",
                width: 80,
                height: "100%",
            }}
        >
            <Ionicons name="trash-outline" size={28} color="white" />
        </Pressable>
    );

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            overshootRight={false}
        >
            <Pressable onPress={onEdit}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: isEditing ? "#f7f7f7" : "white",
                        padding: 12,
                        marginVertical: 4,
                        borderRadius: 8,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        {getUnitIcon(ingredient.unit)}
                        <Text>{`${ingredient.name} — ${ingredient.quantity ?? ""} ${ingredient.unit}`}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                </View>
            </Pressable>
        </Swipeable>
    );
}