import React from "react";
import { Text, StyleSheet } from 'react-native';

interface GreetingProps {
    name: string;
    enthusiasmLevel?: number;
}

const Greeting: React.FC<GreetingProps> = ({name, enthusiasmLevel = 1}) => {
    const exclamationMarks = '!'.repeat(enthusiasmLevel);
    return (
        <Text style={styles.greetingText}>
            Hello, {name}{exclamationMarks}
        </Text>
    )
}

const styles = StyleSheet.create({
    greetingText: {
        fontSize: 18,
        color: 'green',
        marginVertical: 10,
    },
})

export default Greeting;