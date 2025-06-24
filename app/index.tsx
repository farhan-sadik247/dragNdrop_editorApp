import { StyleSheet, View } from "react-native"
import DesignEditor from "../components/DesignEditor"

export default function Index() {
  return (
    <View style={styles.container}>
      <DesignEditor />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
})
