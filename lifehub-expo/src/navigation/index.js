import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from '../screens/Home';
import Tasks from '../screens/Tasks';
import Agenda from '../screens/Agenda';
import Focus from '../screens/Focus';
import Notes from '../screens/Notes';
import Finances from '../screens/Finances';
import Habits from '../screens/Habits';
import Assistant from '../screens/Assistant';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
                           tabBarIcon: ({ focused, color, size }) => {
                   let iconName;

                   if (route.name === 'Home') {
                     iconName = focused ? 'home' : 'home-outline';
                   } else if (route.name === 'Tasks') {
                     iconName = focused ? 'list' : 'list-outline';
                   } else if (route.name === 'Agenda') {
                     iconName = focused ? 'calendar' : 'calendar-outline';
                   } else if (route.name === 'Focus') {
                     iconName = focused ? 'timer' : 'timer-outline';
                   } else if (route.name === 'Notes') {
                     iconName = focused ? 'document-text' : 'document-text-outline';
                   } else if (route.name === 'Finances') {
                     iconName = focused ? 'wallet' : 'wallet-outline';
                   } else if (route.name === 'Habits') {
                     iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
                   } else if (route.name === 'Assistant') {
                     iconName = focused ? 'sparkles' : 'sparkles-outline';
                   }

                   return <Ionicons name={iconName} size={size} color={color} />;
                 },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
                   >
               <Tab.Screen name="Home" component={Home} />
               <Tab.Screen name="Tasks" component={Tasks} />
               <Tab.Screen name="Agenda" component={Agenda} />
               <Tab.Screen name="Focus" component={Focus} />
               <Tab.Screen name="Notes" component={Notes} />
               <Tab.Screen name="Finances" component={Finances} />
               <Tab.Screen name="Habits" component={Habits} />
               <Tab.Screen name="Assistant" component={Assistant} />
             </Tab.Navigator>
    </NavigationContainer>
  );
}