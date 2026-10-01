import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/Loading';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Customer screens
import { HomeScreen } from '../screens/customer/HomeScreen';
import { RestaurantsScreen } from '../screens/customer/RestaurantsScreen';
import { RestaurantMenuScreen } from '../screens/customer/RestaurantMenuScreen';
import { CartScreen } from '../screens/customer/CartScreen';
import { OrdersScreen } from '../screens/customer/OrdersScreen';
import { OrderDetailScreen } from '../screens/customer/OrderDetailScreen';
import { ProfileScreen } from '../screens/customer/ProfileScreen';

// Restaurant screens
import { DashboardScreen } from '../screens/restaurant/DashboardScreen';
import { OrdersScreen as RestaurantOrdersScreen } from '../screens/restaurant/OrdersScreen';
import { OrderDetailScreen as RestaurantOrderDetailScreen } from '../screens/restaurant/OrderDetailScreen';
import { ProductsScreen } from '../screens/restaurant/ProductsScreen';
import { CategoriesScreen } from '../screens/restaurant/CategoriesScreen';
import { InventoryScreen } from '../screens/restaurant/InventoryScreen';
import { SalesScreen } from '../screens/restaurant/SalesScreen';
import { SettingsScreen } from '../screens/restaurant/SettingsScreen';

// Delivery screens
import { DashboardScreen as DeliveryDashboardScreen } from '../screens/delivery/DashboardScreen';
import { DeliveriesScreen } from '../screens/delivery/DeliveriesScreen';
import { DeliveryDetailScreen } from '../screens/delivery/DeliveryDetailScreen';
import { ConfirmDeliveryScreen } from '../screens/delivery/ConfirmDeliveryScreen';
import { HistoryScreen } from '../screens/delivery/HistoryScreen';

// Admin screens
import { DashboardScreen as AdminDashboardScreen } from '../screens/admin/DashboardScreen';
import { UsersScreen } from '../screens/admin/UsersScreen';
import { RestaurantsScreen as AdminRestaurantsScreen } from '../screens/admin/RestaurantsScreen';
import { OrdersScreen as AdminOrdersScreen } from '../screens/admin/OrdersScreen';
import { InventoryScreen as AdminInventoryScreen } from '../screens/admin/InventoryScreen';
import { ReportsScreen } from '../screens/admin/ReportsScreen';
import { PromotionsScreen } from '../screens/admin/PromotionsScreen';
import { SupportScreen } from '../screens/admin/SupportScreen';
import { AuditLogsScreen } from '../screens/admin/AuditLogsScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator(): React.JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Cargando..." />;
  }

  const isRestaurant = user?.role === 'RESTAURANT';
  const isDelivery = user?.role === 'DELIVERY';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : isRestaurant ? (
          // Restaurant stack
          <>
            <Stack.Screen name="Home" component={DashboardScreen} />
            <Stack.Screen name="RestaurantOrders" component={RestaurantOrdersScreen} />
            <Stack.Screen name="RestaurantOrderDetail" component={RestaurantOrderDetailScreen} />
            <Stack.Screen name="RestaurantProducts" component={ProductsScreen} />
            <Stack.Screen name="RestaurantCategories" component={CategoriesScreen} />
            <Stack.Screen name="RestaurantInventory" component={InventoryScreen} />
            <Stack.Screen name="RestaurantSales" component={SalesScreen} />
            <Stack.Screen name="RestaurantSettings" component={SettingsScreen} />
          </>
        ) : isDelivery ? (
          // Delivery stack
          <>
            <Stack.Screen name="Home" component={DeliveryDashboardScreen} />
            <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
            <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
            <Stack.Screen name="ConfirmDelivery" component={ConfirmDeliveryScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </>
        ) : isAdmin ? (
          // Admin stack
          <>
            <Stack.Screen name="Home" component={AdminDashboardScreen} />
            <Stack.Screen name="Users" component={UsersScreen} />
            <Stack.Screen name="Restaurants" component={AdminRestaurantsScreen} />
            <Stack.Screen name="Orders" component={AdminOrdersScreen} />
            <Stack.Screen name="Inventory" component={AdminInventoryScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Promotions" component={PromotionsScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
          </>
        ) : (
          // Customer stack (default)
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Restaurants" component={RestaurantsScreen} />
            <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
