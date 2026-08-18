import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Home, Briefcase, Calendar, User as UserIcon, BookOpen, MessageSquare } from 'lucide-react-native';

import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Screen Imports (Will be implemented in Phase 2)
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import JobsScreen from './src/screens/JobsScreen';
import EventsScreen from './src/screens/EventsScreen';
import ResearchScreen from './src/screens/ResearchScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// The Main App Bottom Tabs
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') return <Home size={size} color={color} />;
          if (route.name === 'Jobs') return <Briefcase size={size} color={color} />;
          if (route.name === 'Events') return <Calendar size={size} color={color} />;
          if (route.name === 'Research') return <BookOpen size={size} color={color} />;
          if (route.name === 'Messages') return <MessageSquare size={size} color={color} />;
          if (route.name === 'Profile') return <UserIcon size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1', // Matches web primary color
        tabBarInactiveTintColor: 'gray',
        headerShown: true, // We will show headers for standard screens
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Research" component={ResearchScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// The Root Router switching on Auth State
function RootNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is logged in
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          // User is NOT logged in
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
