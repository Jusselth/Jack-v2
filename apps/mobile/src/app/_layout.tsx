import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import '../../global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: '#09090b',
          },
          headerTintColor: '#f4f4f5',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: '#09090b',
            borderTopColor: '#27272a',
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#71717a',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Jack Orb',
            headerTitle: 'Jack AI Assistant',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🎙️</Text>,
          }}
        />
        <Tabs.Screen
          name="pendientes"
          options={{
            title: 'Pendientes',
            headerTitle: 'Agenda & Tareas',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📝</Text>,
          }}
        />
        <Tabs.Screen
          name="cuentas"
          options={{
            title: 'Cuentas',
            headerTitle: 'Finanzas & Cuentas',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>💳</Text>,
          }}
        />
      </Tabs>
    </>
  );
}
