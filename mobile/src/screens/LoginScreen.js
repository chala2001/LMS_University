import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/users/login', { email, password });
            await login(res.data);
            // Context update automatically switches to Main layout in App.js
        } catch (err) {
            console.error('Login Error:', err.message, err.response?.data);
            const errorMessage = err.response?.data?.message || err.message || 'Login failed due to network error';
            Alert.alert("Login Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Welcome Back</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>Register here</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    button: {
        backgroundColor: '#6366f1',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
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
