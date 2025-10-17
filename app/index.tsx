import { Text, View, H1, H2, P, A, Container } from "dripsy";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  return (

    <View sx={{
      backgroundColor: '$background',
      padding: 20,
      margin: 5,
      flex: 1,
      marginTop: 50,
      marginBottom: 250,
      borderRadius: 5
    }}>


      <H1 sx={{
        color: '$text', fontSize: 20, marginTop: 20,
        textShadow: 'onImage'
      }}>

        Willkommen!

      </H1>

      <P sx={{ color: '$text', fontSize: 20, marginTop: 20 }}>


        This is the welcome screen for the prototype of my app.

      </P>

      <A sx={{ color: '$text', fontSize: 20, marginTop: 20 }} href="https://dripsy.xyz">

        In the final version, this will be gone.

      </A>



      <Text sx={{ color: '$text', fontSize: 20, marginTop: 20 }}>

        Feel free to explore the app!

      </Text>

      <StatusBar style="dark" />





    </View>
  );
}
