// components/ThemedCard.tsx
import { View } from "dripsy"

export const ThemeCard = ({ children, ...props }) => {
    return (
        <View
            sx={{
                backgroundColor: "$background",
                padding: "m",
                borderRadius: "l",

                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },

                elevation: 4,
            }}
            {...props}
        >
            {children}
        </View>
    )
}
