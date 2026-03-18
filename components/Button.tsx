import React from "react";

import { Pressable, Text } from "dripsy";

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
                m: "xs",
                borderRadius: "m",
                alignItems: "center",
                boxShadow: "md",
            }}
            style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1

            })}

        >
            <Text sx={{
                color: "$text",
                fontWeight: "bold"
            }}>{title}</Text>
        </Pressable>
    );
}


export default Button;

