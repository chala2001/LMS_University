import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import api from '../api';

export default function RegisterScreen({ navigation }) {
    const [formData, setFormData] = useState({
        name: '', email: '', password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/register', formData);
            Alert.alert("Success!", "Registration successful. Please login.", [
                { text: "OK", onPress: () => navigation.navigate('Login') }
            ]);
        } catch (err) {
            console.error('Registration Error:', err.response?.data || err.message);
            Alert.alert("Registration Failed", err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Create Account</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#9ca3af"
                    value={formData.name}
                    onChangeText={(val) => setFormData({...formData, name: val})}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#9ca3af"
                    value={formData.email}
                    onChangeText={(val) => setFormData({...formData, email: val})}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(val) => setFormData({...formData, password: val})}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Login here</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 30,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        color: '#ffffff',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    label: {
        color: '#e2e8f0',
        marginBottom: 8,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#6366f1',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#9ca3af',
    },
    linkText: {
        color: '#6366f1',
        fontWeight: 'bold',
    }
});
