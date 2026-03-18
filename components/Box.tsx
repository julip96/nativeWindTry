import React, { ReactNode } from 'react';

import { Platform } from 'react-native';

import { View } from 'dripsy';

interface BoxProps {
    children?: ReactNode;
    flexDir?: string;
    [key: string]: any;
}

export default function Box({ children, flexDir, ...rest }: BoxProps) {
    return (
        <View sx={{
            m: "s",
            mt: "xs",
            bg: "$background",
            p: Platform.select({ ios: "m", android: "s" }),
            borderRadius: Platform.select({ ios: "m", android: "m" }),
            borderWidth: 2,
            boxShadow: "md",
            shadowColor: "black",
            borderColor: "$background",
            flexDirection: flexDir
        }}
            {...rest}
        >
            {children}
        </View>

    )
};
