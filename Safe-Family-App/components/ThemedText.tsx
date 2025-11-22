import { StyleProp, StyleSheet, Text, TextStyle, useColorScheme, View, ViewStyle } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Color'

interface ThemedTextProps{
    // safe?: boolean,
    style?: StyleProp<TextStyle>,
    children?: React.ReactNode,
    onPress?: (text: string) => void
}

const ThemedText = ({style, onPress, ...props}: ThemedTextProps) => {
    const colorScheme = useColorScheme()
    console.log(colorScheme)
    
    const theme = Colors[colorScheme as keyof typeof Colors] ?? Colors.light
    return (
        <Text style={[{color: theme.color}, style]} {...props}/>
    )
}

export default ThemedText

const styles = StyleSheet.create({
    
})