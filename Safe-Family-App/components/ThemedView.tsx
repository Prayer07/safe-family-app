import { StyleProp, StyleSheet, Text, useColorScheme, View, ViewStyle } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Color'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ThemedViewProps{
    safe?: boolean,
    style?: StyleProp<ViewStyle>,
    children?: React.ReactNode
}

const ThemedView = ({safe=false, style, ...props}: ThemedViewProps) => {
    const colorScheme = useColorScheme()
    console.log(colorScheme)
    
    const theme = Colors[colorScheme as keyof typeof Colors] ?? Colors.light

    return (
        <View style={[ styles.container, {backgroundColor: theme.background}, style]} {...props}/>
    )
}

export default ThemedView

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
})