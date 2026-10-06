import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/Loading';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/customer/HomeScreen';
import { RestaurantsScreen } from '../screens/customer/RestaurantsScreen';
import { RestaurantMenuScreen } from '../screens/customer/RestaurantMenuScreen';
import { CartScreen } from '../screens/customer/CartScreen';
import { CheckoutScreen } from '../screens/customer/CheckoutScreen';
import { OrdersScreen } from '../screens/customer/OrdersScreen';
import { OrderDetailScreen } from '../screens/customer/OrderDetailScreen';
import { ProfileScreen } from '../screens/customer/ProfileScreen';

import { DashboardScreen as RestaurantDashboardScreen } from '../screens/restaurant/DashboardScreen';
import { OrdersScreen as RestaurantOrdersScreen } from '../screens/restaurant/OrdersScreen';
import { OrderDetailScreen as RestaurantOrderDetailScreen } from '../screens/restaurant/OrderDetailScreen';
import { ProductsScreen } from '../screens/restaurant/ProductsScreen';
import { CategoriesScreen } from '../screens/restaurant/CategoriesScreen';
import { InventoryScreen } from '../screens/restaurant/InventoryScreen';
import { SalesScreen } from '../screens/restaurant/SalesScreen';
import { SettingsScreen } from '../screens/restaurant/SettingsScreen';

import { DashboardScreen as DeliveryDashboardScreen } from '../screens/delivery/DashboardScreen';
import { DeliveriesScreen } from '../screens/delivery/DeliveriesScreen';
import { DeliveryDetailScreen } from '../screens/delivery/DeliveryDetailScreen';
import { ConfirmDeliveryScreen } from '../screens/delivery/ConfirmDeliveryScreen';
import { HistoryScreen } from '../screens/delivery/HistoryScreen';

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
  if (isLoading) return <Loading fullScreen message="Cargando..." />;

  const isRestaurant = user?.role === 'RESTAURANT';
  const isDelivery = user?.role === 'DELIVERY';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : isRestaurant ? (
          <>
            <Stack.Screen name="Home" component={RestaurantDashboardScreen} />
            <Stack.Screen name="RestaurantOrders" component={RestaurantOrdersScreen} />
            <Stack.Screen name="RestaurantOrderDetail" component={RestaurantOrderDetailScreen} />
            <Stack.Screen name="RestaurantProducts" component={ProductsScreen} />
            <Stack.Screen name="RestaurantCategories" component={CategoriesScreen} />
            <Stack.Screen name="RestaurantInventory" component={InventoryScreen} />
            <Stack.Screen name="RestaurantSales" component={SalesScreen} />
            <Stack.Screen name="RestaurantSettings" component={SettingsScreen} />
          </>
        ) : isDelivery ? (
          <>
            <Stack.Screen name="Home" component={DeliveryDashboardScreen} />
            <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
            <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
            <Stack.Screen name="ConfirmDelivery" component={ConfirmDeliveryScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </>
        ) : isAdmin ? (
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
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Restaurants" component={RestaurantsScreen} />
            <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} options={{ headerShown: true, title: "Menú" }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true, title: "Carrito" }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: "Finalizar pedido" }} />
            <Stack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: true, title: "Mis pedidos" }} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: true, title: "Detalle del pedido" }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: "Mi perfil" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}