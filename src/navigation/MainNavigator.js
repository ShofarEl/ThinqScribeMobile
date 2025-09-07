// ThinqScribe/src/navigation/MainNavigator.js
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useAuth } from '../context/MobileAuthContext';

// Dashboard screens
import ExploreScreen from '../screens/ExploreScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileSettings from '../screens/ProfileSettings';
import StudentChat from '../screens/StudentChat';
import StudentDashboard from '../screens/StudentDashboard';
import StudentWriterList from '../screens/StudentWriterList';
import WriterDashboard from '../screens/WriterDashboard';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const DashboardStack = () => {
  const { user } = useAuth();
  
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Dashboard"
    >
      <Stack.Screen 
        name="Dashboard" 
        component={user?.role === 'writer' ? WriterDashboard : StudentDashboard} 
      />
      <Stack.Screen 
        name="Writers" 
        component={StudentWriterList} 
        options={{
          title: 'Find Writers'
        }}
      />
      <Stack.Screen
        name="StudentChat"
        component={StudentChat}
        options={{
          title: 'Chat'
        }}
      />
      <Stack.Screen
        name="WriterProjects"
        component={StudentWriterList}
        options={{
          title: 'Find Projects'
        }}
      />
    </Stack.Navigator>
  );
};

const MessagesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Messages" component={MessagesScreen} />
  </Stack.Navigator>
);

const ExploreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Explore" component={ExploreScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen 
      name="ProfileSettings" 
      component={ProfileSettings} 
      options={{
        title: 'Profile Settings'
      }}
    />
  </Stack.Navigator>
);

const MainNavigator = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#015382',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardStack}
        options={{
          title: user?.role === 'writer' ? 'Writer Dashboard' : 'Student Dashboard'
        }}
      />
      <Tab.Screen name="Messages" component={MessagesStack} />
      <Tab.Screen name="Explore" component={ExploreStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default MainNavigator;