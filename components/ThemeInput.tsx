// components/ThemedInput.tsx
import { TextInput } from "react-native"
import { useSx } from "dripsy"

export const ThemeInput = ({ style, ...props }) => {
    const sx = useSx()

    return (
        <TextInput
            style={[
                sx({
                    backgroundColor: "$muted",
                    color: "$text",
                    padding: "m",
                    borderRadius: "m",
                    fontSize: 16,

                    // dünner iOS border
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.08)",
                }),
                style,
            ]}
            placeholderTextColor="rgba(0,0,0,0.4)"
            {...props}
        />
    )
}
