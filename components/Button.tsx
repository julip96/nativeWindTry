import React from "react";

import { Pressable, Text } from "dripsy";
import { Platform } from "react-native/Libraries/Utilities/Platform";

interface ButtonProps {
    title: string;
    onPress?: () => void;
    color?: string;
}

const Button = ({
    title,
    onPress,
    color
}: ButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            sx={{
                bg: color,
                p: "m",
                m: "s",
                borderRadius: "m",
                alignItems: "center",
                boxShadow: "md",
            }}
            style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1

            })}

        >
            <Text sx={{
                color: "$textContrary",
                fontWeight: "bold"
            }}>{title}</Text>
        </Pressable>
    );
}


export default Button;

