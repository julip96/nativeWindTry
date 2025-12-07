// components/SectionTitle.tsx
import { Text } from "dripsy"

export const SectionTitle = ({ children }) => (
    <Text
        sx={{
            fontSize: 18,
            fontWeight: "600",
            marginBottom: "s",
            color: "$text",
        }}
    >
        {children}
    </Text>
)
