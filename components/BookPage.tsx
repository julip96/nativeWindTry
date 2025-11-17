import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { width, height } = Dimensions.get('window')

export default function BookPage({ children, pageIndex }) {
    return (
        <View style={styles.pageWrapper}>

            {/* --- Main paper gradient background (more visible) --- */}
            <LinearGradient
                colors={['#fff5d6', '#ffe8b3']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.paperBackground}
            />

            {/* --- Subtle paper texture (noise-like effect) --- */}
            <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(0,0,0,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.textureLayer}
            />

            {/* --- Vertical spine shadow on the left --- */}
            <LinearGradient
                colors={['rgba(0,0,0,0.22)', 'rgba(0,0,0,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.spineShadow}
            />

            {/* --- Bottom-corner curl (3D effect) --- */}
            <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.25)']}
                start={{ x: 1, y: 1 }}
                end={{ x: 0.7, y: 0.7 }}
                style={styles.bottomCurl}
            />

            {/* --- Content --- */}
            <View style={styles.content}>
                {children}

                {pageIndex > 0 && (
                    <View style={styles.pageNumberWrapper}>
                        <Text style={styles.pageNumberText}>{pageIndex}</Text>
                    </View>
                )}
            </View>
        </View>
    )
}

const PAGE_WIDTH = width * 0.92
const PAGE_HEIGHT = height * 0.92

const styles = StyleSheet.create({
    pageWrapper: {
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
    },

    paperBackground: {
        position: 'absolute',
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        borderRadius: 18,
        top: height * 0.04,
    },

    textureLayer: {
        position: 'absolute',
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        borderRadius: 18,
        top: height * 0.04,
        opacity: 0.20,
        mixBlendMode: 'overlay',
    },

    spineShadow: {
        position: 'absolute',
        left: width * 0.04,
        top: height * 0.04,
        width: 20,
        height: PAGE_HEIGHT,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        opacity: 0.40,
    },

    bottomCurl: {
        position: 'absolute',
        bottom: height * 0.04 + 2,
        right: width * 0.04 + 2,
        width: 90,
        height: 90,
        borderBottomRightRadius: 18,
        opacity: 0.5,
    },

    content: {
        position: 'absolute',
        width: PAGE_WIDTH * 0.88,
        height: PAGE_HEIGHT * 0.86,
        top: height * 0.07,
        paddingHorizontal: 20,
    },

    pageNumberWrapper: {
        position: "absolute",
        bottom: 5,
        width: "100%",
        alignItems: "center",
    },

    pageNumberText: {
        opacity: 0.55,
        fontSize: 14,
    },
})
