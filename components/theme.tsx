// theme.ts
import { makeTheme } from 'dripsy'
import { Platform } from 'react-native'

// --- STANDARD THEME ---
const standardColors = {
    $background: '#ffffff',
    $text: '#000000',
    $primary: '#dcd6f7',
    $secondary: '#a6b1e1',
    $accent: '#ED6A5A',
    $muted: '#f2e9e4',
    $disabledBackground: '#e6e6e6',
    $disabledText: '#000000',
}

// --- PINK THEME ---
const pinkColors = {
    $background: '#ffffff',
    $text: '#000000',
    $primary: '#ff4da6',
    $secondary: '#ff80bf',
    $accent: '#ffb3d9',
    $muted: '#ffd6eb',
    $disabledBackground: '#f2bcd6',
    $disabledText: '#a26c9a',
}

const baseTheme = {

    space: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    radii: {
        s: 6,
        m: 12,
        l: 20,
    },

    text: {
        body: {
            fontSize: 16,
            color: '$text',
        },
        heading: {
            fontSize: 22,
            color: '$text',
            // fontFamily: fontName,
            // fontWeight: 'bold',
        },
        small: {
            fontSize: 14,
            color: '$text',
        },
    },

    shadows: {
        md: {
            ...Platform.select({
                ios: {

                    // iOS
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 6,
                },
                android: {

                    // Android
                    elevation: 4,

                }
            })
        },
    },



}


export const standardTheme = makeTheme({ colors: standardColors, ...baseTheme })
export const pinkTheme = makeTheme({ colors: pinkColors, ...baseTheme })

export type MyTheme = typeof standardTheme
declare module 'dripsy' {
    interface DripsyCustomTheme extends MyTheme { }
}
