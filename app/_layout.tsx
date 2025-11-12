'use client'

import React, { useState, useEffect } from 'react'
import { Platform } from 'react-native'
import { View, Pressable, Text } from 'dripsy'
import { useColorScheme } from 'react-native'
import { ThemeProvider } from '../components/ThemeProvider'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, Slot, useSegments } from 'expo-router'
import { supabase } from '../utils/supabase'
import Auth from '../components/Auth'
import { Session } from '@supabase/supabase-js'
import { SessionProvider } from '../components/SessionProvider'

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

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {

      setSession(session)

    })

    return () => {

      subscription.unsubscribe()

    }

  }, [])

  const tabs = [

    { name: 'recipeBooks', label: 'Books', path: '/recipeBooks' },
    { name: 'recipesListScreen', label: 'Recipes', path: '/recipesListScreen' },
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
