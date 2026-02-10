import AsyncStorage from '@react-native-async-storage/async-storage'
import { DripsyProvider } from 'dripsy'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { pinkTheme, standardTheme } from './Theme'

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
    const [isLoaded, setIsLoaded] = useState(false)

    // Load the saved mode from storage when app starts
    useEffect(() => {

        const loadStoredMode = async () => {

            try {

                const saved = await AsyncStorage.getItem('theme-mode')

                if (saved === 'pink' || saved === 'standard') {

                    setMode(saved)

                }

            } catch (e) {

                console.warn('Error loading saved theme mode:', e)

            } finally {

                setIsLoaded(true)

            }

        }

        loadStoredMode()

    }, [])

    // Whenever mode changes, save it to storage
    useEffect(() => {

        if (isLoaded) {

            AsyncStorage.setItem('theme-mode', mode).catch((e) =>

                console.warn('Error saving theme mode:', e)

            )

        }

    }, [mode, isLoaded])

    const activeTheme = mode === 'pink' ? pinkTheme : standardTheme

    // Don’t render anything until the theme is loaded (avoids flicker)
    if (!isLoaded) return null

    return (

        <ThemeContext.Provider value={{ mode, setMode }}>

            <DripsyProvider theme={activeTheme}>{children}</DripsyProvider>

        </ThemeContext.Provider>

    )

}
