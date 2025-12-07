// components/Page.tsx
import { ScrollView } from "react-native"
import { View } from "dripsy"

export const ThemePage = ({ children }) => {
    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View
                sx={{
                    flex: 1,
                    padding: "l",
                    backgroundColor: "$background",
                    gap: "l",
                }}
            >
                {children}
            </View>
        </ScrollView>
    )
}
