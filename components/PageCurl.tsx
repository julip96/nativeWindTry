import React, { useRef } from "react";
import { Animated, View, Pressable } from "react-native";

export default function PageCurl({ children, onNext, onPrev }) {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const animateCurl = (direction: "next" | "prev") => {
        rotateAnim.setValue(0);

        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
        }).start(() => {
            rotateAnim.setValue(0);
            if (direction === "next") onNext?.();
            else onPrev?.();
        });
    };

    const rotateY = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "90deg"], // flip-out effect
    });

    const opacity = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });

    return (
        <Animated.View
            style={{
                flex: 1,
                transform: [{ perspective: 800 }, { rotateY }],
                opacity,
            }}
        >
            <View style={{ flex: 1 }}>{children}</View>

            {/* Tap zones */}
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "30%",
                    left: 0,
                }}
            >
                <Pressable style={{ flex: 1 }} onPress={() => animateCurl("prev")} />
            </View>

            <View
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "30%",
                    right: 0,
                }}
            >
                <Pressable style={{ flex: 1 }} onPress={() => animateCurl("next")} />
            </View>
        </Animated.View>
    );
}
