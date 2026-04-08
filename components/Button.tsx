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
            sx={{
                bg: color,
                p: "m",
                m: "s",
                borderRadius: "m",
                alignItems: "center",
                boxShadow: "md",
            }}
            onPress={onPress}
        >
            <Text sx={{
                color: "$textContrary",
                fontWeight: "bold"
            }}>{title}</Text>
        </Pressable>
    );
}


export default Button;

