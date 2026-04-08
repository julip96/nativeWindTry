import { Text, View, P, ScrollView } from "dripsy";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (


    <ScrollView
      sx={{ flex: 1, backgroundColor: '$background', p: 's' }}
    >


      <Text variant="heading">
        Welcome!
      </Text>

      <Text variant="body">

        <P>
          This is the welcome screen for the prototype of my app.
        </P>

      </Text>

      <Text variant="body">

        <P>
          In the final version, this will be gone.
        </P>

      </Text>

      <Text variant="body">

        <P>
          Fee
          l free to explore the app using the tab navigation below!
        </P>
      </Text>


      <StatusBar style="dark" />

    </ScrollView>


  );
}
