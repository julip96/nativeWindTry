// theme.ts
import { makeTheme } from 'dripsy'

// --- STANDARD THEME ---
const standardColors = {
    $background: '#fffaf0',
    $text: '#333333',
    $primary: '#e07a5f',
    $secondary: '#3d9970',
    $muted: '#f2e9e4',
    $disabledBackground: '#e6e6e6',
    $disabledText: '#999999',
}

// --- PINK THEME ---
const pinkColors = {
    $background: '#ffe6f2',
    $text: '#3a003a',
    $primary: '#ff4da6',
    $secondary: '#ff80bf',
    $muted: '#ffd6eb',
    $disabledBackground: '#f2bcd6',
    $disabledText: '#a26c9a',
}

const baseTheme = {
    space: { xs: 4, s: 8, m: 16, l: 24, xl: 32 },
    radii: { s: 6, m: 12, l: 20 },
    text: {
        body: { fontSize: 16, color: '$text' },
        heading: { fontSize: 22, fontWeight: 'bold', color: '$text' },
        small: { fontSize: 14, color: '$text' },
    },
}

export const standardTheme = makeTheme({ colors: standardColors, ...baseTheme })
export const pinkTheme = makeTheme({ colors: pinkColors, ...baseTheme })

export type MyTheme = typeof standardTheme
declare module 'dripsy' {
    interface DripsyCustomTheme extends MyTheme { }
}
