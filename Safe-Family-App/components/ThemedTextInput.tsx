import { KeyboardTypeOptions, StyleProp, StyleSheet, Text, TextInput, TextStyle, useColorScheme, View, ViewStyle } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Color'

interface ThemedTextInputProps{
    placeholder: string
    value?: string
    autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined
    keyboardType?: KeyboardTypeOptions
    placeholderTextColor?: string
    secureTextEntry?: boolean
    onChangeText: (text: string) => void
    style?: StyleProp<TextStyle>,
    children?: React.ReactNode
}

const ThemedTextInput = ({placeholder, keyboardType, placeholderTextColor, secureTextEntry, style, ...props}: ThemedTextInputProps) => {
    const colorScheme = useColorScheme()
    console.log(colorScheme)
    
    const theme = Colors[colorScheme as keyof typeof Colors] ?? Colors.light
    return (
        <TextInput 
            placeholder={placeholder} 
            placeholderTextColor={placeholderTextColor || theme.placeholder} 
            style={[{color: theme.color}, style]}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            // autoCapitalize
            {...props}
        />
    )
}

export default ThemedTextInput

const styles = StyleSheet.create({

})