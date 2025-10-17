import React, { createContext, useState, useContext } from 'react'
import { DripsyProvider } from 'dripsy'
import { standardTheme, pinkTheme } from './theme'

type ThemeContextType = {
    mode: 'standard' | 'pink'
    setMode: (mode: 'standard' | 'pink') => void
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'standard',
    setMode: () => { },
})

export const useThemeMode = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<'standard' | 'pink'>('standard')
    const activeTheme = mode === 'pink' ? pinkTheme : standardTheme

    return (
        <ThemeContext.Provider value={{ mode, setMode }}>
            <DripsyProvider theme={activeTheme}>{children}</DripsyProvider>
        </ThemeContext.Provider>
    )
}
