import React from "react";

import { Pressable, Text } from "dripsy";
import { Platform } from "react-native/Libraries/Utilities/Platform";

interface ButtonProps {
    title: string;
    onPress?: () => void;
    color?: string;
    disabled?: boolean;
}

const Button = ({
    title,
    onPress,
    color,
    disabled
}: ButtonProps) => {
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            sx={{
                bg: disabled ? '$disabledBackground' : color,
                p: "m",
                m: "s",
                borderRadius: "m",
                alignItems: "center",
                boxShadow: "md",
            }}
            style={({ pressed }) => ({

                opacity: disabled ? 0.5 : pressed ? 0.6 : 1

            })}
            disabled={disabled}
        >
            <Text sx={{
                color: "$textContrary",
                fontWeight: "bold"
            }}>{title}</Text>
        </Pressable>
    );
}


export default Button;

