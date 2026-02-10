'use client'

import { Session } from '@supabase/supabase-js'
import { Pressable, Text, View } from 'dripsy'
import { Href, Slot, useRouter, useSegments } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Keyboard, Platform, useColorScheme } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Auth from '../components/Auth'
import { SessionProvider } from '../components/SessionProvider'
import { ThemeProvider } from '../components/ThemeProvider'
import { supabase } from '../utils/supabase'

type TabConfig = {
  name: string
  label: string
  path: Href
}

export default function RootLayout() {

  const colorMode = useColorScheme()
  const router = useRouter()
  const segments = useSegments()
  const activeRoute = segments[0] ?? 'index'

  const [session, setSession] = useState<Session | null>(null)

  // Supabase session handling
  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {

      setSession(session)
    })

    // In Supabase v2, onAuthStateChange returns { data: { subscription } }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Guard against missing subscription when cleaning up
    return () => {
      subscription?.unsubscribe()
    }

  }, [])

  const tabs: TabConfig[] = [
    { name: 'recipeBooks', label: 'Books', path: '/recipeBooks' },
    { name: 'recipes', label: 'Recipes', path: '/recipes' },
    { name: 'settings', label: 'Settings', path: '/settings' },
  ]

  // If no session, show Auth screen instead of tabs
  if (!session || !session.user) {

    return (

      <ThemeProvider>

        <SafeAreaProvider>

          <SafeAreaView style={{ flex: 1 }}>

            <Auth />

          </SafeAreaView>

        </SafeAreaProvider>

      </ThemeProvider>

    )

  }

  // User is logged in, show normal layout
  return (

    <ThemeProvider>

      <SafeAreaProvider>

        <SessionProvider>
          {Platform.OS === 'ios' ? (
            /*
            <SafeAreaView style={{ flex: 1 }}>
              <NativeTabs>
                <NativeTabs.Trigger name="index">
                  <Icon sf="house.fill" />
                  <Label>Home</Label>
                </NativeTabs.Trigger>
  
                <NativeTabs.Trigger name="recipesListScreen">
                  <Icon sf="fork.knife" />
                  <Label>Recipes</Label>
                </NativeTabs.Trigger>
  
                <NativeTabs.Trigger name="settings">
                  <Icon sf="gear" />
                  <Label>Settings</Label>
                </NativeTabs.Trigger>
              </NativeTabs>
            </SafeAreaView> */

            <SafeAreaView style={{ flex: 1 }}>
              {/* Active screen */}

              <View sx={{ flex: 1 }}>

                <Slot />

              </View>

              {/* Bottom tab bar */}
              <View

                sx={{

                  height: 60,
                  flexDirection: 'row',
                  borderTopWidth: 1,
                  borderColor: '$border',
                  backgroundColor: '$background',

                }}

              >

                {tabs.map((tab) => {

                  const isActive = activeRoute === tab.name

                  return (

                    <Pressable

                      key={tab.name}

                      sx={{

                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isActive ? '$primary' : '$background',

                      }}

                      onPress={() => {

                        // Always dismiss keyboard when switching tabs
                        Keyboard.dismiss()

                        if (!isActive) router.push(tab.path)

                      }}

                    >

                      <Text

                        sx={{

                          color: isActive ? '$textOnPrimary' : '$text',
                          fontWeight: isActive ? '600' : '400',

                        }}

                      >

                        {tab.label}

                      </Text>

                    </Pressable>

                  )

                })}

              </View>

            </SafeAreaView>

          ) : (

            <SafeAreaView style={{ flex: 1 }}>

              {/* Active screen */}
              <View sx={{ flex: 1 }}>

                <Slot />

              </View>

              {/* Bottom tab bar */}
              <View

                sx={{

                  height: 60,
                  flexDirection: 'row',
                  borderTopWidth: 1,
                  borderColor: '$border',
                  backgroundColor: '$background',

                }}

              >

                {tabs.map((tab) => {

                  const isActive = activeRoute === tab.name

                  return (

                    <Pressable

                      key={tab.name}

                      sx={{

                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isActive ? '$primary' : '$background',

                      }}

                      onPress={() => {

                        // Always dismiss keyboard when switching tabs
                        Keyboard.dismiss()

                        if (!isActive) router.push(tab.path)

                      }}

                    >

                      <Text

                        sx={{

                          color: isActive ? '$textOnPrimary' : '$text',
                          fontWeight: isActive ? '600' : '400',

                        }}

                      >

                        {tab.label}

                      </Text>

                    </Pressable>

                  )

                })}

              </View>

            </SafeAreaView>

          )}

        </SessionProvider>

      </SafeAreaProvider>

    </ThemeProvider>

  )

}
