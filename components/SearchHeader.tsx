import React, { useEffect, useRef } from 'react'
import { Pressable, Animated } from 'react-native'
import { View, Text, TextInput } from 'dripsy'
import { Ionicons } from '@expo/vector-icons'

type SearchHeaderProps = {
    title: string
    searchQuery: string
    onSearchChange: (text: string) => void
    isSearching: boolean
    setIsSearching: (value: boolean) => void
    rightAction?: React.ReactNode
    searchPlaceholder?: string
}

export function SearchHeader({
    title,
    searchQuery,
    onSearchChange,
    isSearching,
    setIsSearching,
    rightAction,
    searchPlaceholder = 'Search...',
}: SearchHeaderProps) {
    const searchAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(searchAnim, {
            toValue: isSearching ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start()
    }, [isSearching])

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
            }}
        >
            {/* TITLE */}
            <Text variant="heading">{title}</Text>

            <View style={{ flex: 1 }} />

            {/* ACTIONS */}
            <Animated.View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    opacity: searchAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0],
                    }),
                    transform: [
                        {
                            translateX: searchAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -20],
                            }),
                        },
                    ],
                    pointerEvents: isSearching ? 'none' : 'auto',
                }}
            >
                <Pressable
                    onPress={() => setIsSearching(true)}
                    android_ripple={{ color: '#ccc' }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                    <Ionicons name="search" size={24} color="black" />
                </Pressable>

                {rightAction}
            </Animated.View>

            {/* SEARCH BAR */}
            <Animated.View
                style={{
                    position: 'absolute',
                    right: 0,
                    left: 110,
                    flexDirection: 'row',
                    alignItems: 'center',
                    opacity: searchAnim,
                    transform: [
                        {
                            translateX: searchAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [40, 0],
                            }),
                        },
                    ],
                    pointerEvents: isSearching ? 'auto' : 'none',
                }}
            >
                <TextInput
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholder={searchPlaceholder}
                    autoFocus
                    sx={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '$border',
                        borderRadius: 'm',
                        p: 's',
                        bg: '$muted',
                    }}
                />

                <Pressable
                    onPress={() => {
                        setIsSearching(false)
                        onSearchChange('')
                    }}
                    style={{ marginLeft: 8 }}
                >
                    <Ionicons name="close" size={24} color="black" />
                </Pressable>
            </Animated.View>
        </View>
    )
}
