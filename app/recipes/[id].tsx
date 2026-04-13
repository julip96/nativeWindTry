import React, { use } from 'react'
import { File, Directory } from "expo-file-system/next";
import * as FileSystem from 'expo-file-system/legacy';
import { View, Text, ScrollView } from 'dripsy'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/utils/supabase';
import { Image } from 'react-native';
import Button from '@/components/Button'

import { useSession } from "@/components/SessionProvider";

export default function RecipeDetailsScreen() {

    // get user id
    const { session } = useSession();
    const userId = session?.user.id;

    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [recipe, setRecipe] = React.useState<any | null>(null);

    const [recipeLoading, setRecipeLoading] = React.useState(false);
    const [imageLoading, setImageLoading] = React.useState(false);

    const [imageUri, setImageUri] = React.useState<string | null>(null);

    React.useEffect(() => {

        const loadRecipe = async () => {

            if (!id) return

            try {

                setRecipeLoading(true);

                const { data, error }
                    = await supabase
                        .from('recipes')
                        .select('*')
                        .eq('id', id)
                        .single()

                if (error) throw error

                setRecipe(data)



            } catch (e) {

                console.error('Error loading recipe: ', e)
                Alert.alert('Error', 'Could not load recipe.')

            } finally {
                setRecipeLoading(false);
            }
        }

        loadRecipe()

    }, [id])

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const imageExists = async (uri: string) => {
        const info = await FileSystem.getInfoAsync(uri);
        return info.exists;
    };

    React.useEffect(() => {

        if (!recipe) return;

        let isActive = true;

        const loadImage = async (localImageUri?: string, privateBucketImageId?: string) => {

            try {

                setImageUri(null);
                setImageLoading(true);

                if (typeof localImageUri === 'string' && localImageUri.length > 0) {
                    const exists = await FileSystem.getInfoAsync(localImageUri);

                    if (exists.exists) {
                        setImageUri(localImageUri);
                        return;
                    }
                }

                console.log("[1] Attempting to load image with id: ", privateBucketImageId);
                if (!privateBucketImageId) {
                    console.error("No remote image id");
                    return;
                }

                const { data, error } = await supabase.storage

                    .from("recipe_images")
                    .download(privateBucketImageId);

                if (error || !data || !isActive) {
                    console.error("Error downloading image: ", error);
                    return;
                }

                console.log("[2] Load image data: ", data);

                const base64Image = await blobToBase64(data);

                if (!isActive) return;

                setImageUri(base64Image);

            }
            catch (e) {
                console.error("Error downloading image: ", e);
                return null;
            } finally {
                setImageLoading(false);
            }

        }
        loadImage(recipe?.local_image_url, recipe?.private_bucket_image_id);
        return () => {
            isActive = false;
        }

    }, [recipe]);

    if (!recipe) {
        return (<View sx={{ alignItems: 'center', marginTop: 20 }}>

            <ActivityIndicator size="large" />

        </View>);
    }
    const deleteRecipe = async () => {

        Alert.alert(
            'Delete Recipe',
            'Are you sure you want to delete this recipe?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {


                        try {

                            await supabase.from('recipes').delete().eq('id', id)
                            router.back()

                        } catch (e) {

                            console.error('Error deleting recipe')
                            Alert.alert('Error', 'Could not delete recipe')

                        }


                    }
                }
            ]
        )
    }

    const ingredients =
        typeof recipe.ingredients === 'string'
            ? JSON.parse(recipe.ingredients)
            : recipe.ingredients








    return (

        <ScrollView sx={{ flex: 1, bg: '$background', p: 'm' }}>
            {recipeLoading ? (

                <View sx={{ alignItems: 'center', marginTop: 20 }}>

                    <ActivityIndicator size="large" />

                </View>

            ) : (
                <View >

                    <Text variant="heading" sx={{ mb: 'm' }}>

                        {recipe.title}

                    </Text>




                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={{
                                width: 300,
                                height: 200,
                                borderRadius: 12,
                                marginBottom: 16,
                            }}
                            resizeMode="cover"
                        />
                    ) : (
                        <ActivityIndicator />
                    )}

                    <Text variant="heading" sx={{ mb: 'm' }}>

                        Ingredients:

                    </Text>

                    {ingredients && ingredients.length > 0 ? (
                        ingredients.map((item: any, index: number) => (
                            <View
                                key={index}
                                sx={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    bg: '$muted',
                                    p: 's',
                                    mb: 'xs',
                                    borderRadius: 'm',
                                }}
                            >
                                {/* Amount */}
                                <Text sx={{ width: 60, textAlign: 'left', fontWeight: 'bold' }}>
                                    {item.quantity ?? item.amount ?? '-'}
                                </Text>

                                {/* Unit */}
                                <Text sx={{ width: 60, textAlign: 'center' }}>
                                    {item.unit ?? ''}
                                </Text>

                                {/* Name */}
                                <Text sx={{ flex: 1, textAlign: 'left' }}>
                                    {item.name ?? ''}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text variant="body">No ingredients found.</Text>
                    )}


                    <Text variant="heading" sx={{ mb: 'm' }}>

                        Instructions:

                    </Text>

                    <Text variant="body">{recipe.instructions}</Text>


                    {/* Delete Recipe */}
                    <Button
                        title="Delete"
                        onPress={deleteRecipe}
                        color='$primary'
                    />

                    <Button
                        title="Edit"
                        onPress={() => router.replace(`./editRecipe?id=${id}`)}
                        color='$secondary'
                    />

                    <StatusBar style="auto" />

                </View>
            )}

        </ScrollView>
    )
}
