import { Pressable } from "react-native"
import { Text, View } from "dripsy"
import { useState } from "react"

export const ThemeButton = ({ title, onPress, sx }) => {
    const [pressed, setPressed] = useState(false)

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={{ alignSelf: "stretch" }}   // <- nimmt die Breite des Containers ein
        >
            <View
                sx={{
                    paddingY: 12,
                    paddingX: 16,
                    backgroundColor: "$primary",
                    borderRadius: 12,
                    opacity: pressed ? 0.7 : 1,
                    alignItems: "center",
                    justifyContent: "center",


                    shadowColor: "black",
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },

                    ...sx,
                }}
            >
                <Text
                    sx={{

                        textAlign: "center",
                        fontSize: 16,
                        fontWeight: "600",
                    }}
                >
                    {title}
                </Text>
            </View>
        </Pressable>
    )
}
