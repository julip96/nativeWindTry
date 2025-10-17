import React from 'react';
import { Platform } from 'react-native';
import { DripsyProvider, View, Pressable, Text } from 'dripsy';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '../components/themeProvider';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Slot, useSegments } from 'expo-router';

export default function RootLayout() {
  const colorMode = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const activeRoute = segments[0] ?? 'index';

  const tabs = [
    { name: 'index', label: 'Home', path: '/' },
    { name: 'recipesListScreen', label: 'Recipes', path: '/recipesListScreen' },
    { name: 'settings', label: 'Settings', path: '/settings' },
  ];

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        {Platform.OS === 'ios' ? (
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
                const isActive = activeRoute === tab.name;
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
                      if (!isActive) router.push(tab.path);
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
                );
              })}
            </View>
          </SafeAreaView>
        )}
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
