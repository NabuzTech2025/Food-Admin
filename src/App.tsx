import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminLayout from "./pages/Layout";
import Login from "./pages/Login";
import { useAdminStore } from "./context/store/useAdminStore";
import { useEffect } from "react";
import { setNavigate } from "./utils/navigateHelper";

const NavigateSetter = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
};
import { getSessionAdminToken } from "./utils/storage";
import Tax from "./pages/Tax";
import Category from "./pages/Product/Category";
import Product from "./pages/Product/Product";
import Toppings from "./pages/Product/Toppings";
import ToppingGroups from "./pages/Product/ToppingGroups";
import GroupItem from "./pages/Product/GroupItem";
import VariantGroups from "./pages/Product/Variant-groups";
import Coupons from "./pages/Product/Coupons";
import AddAllergy from "./pages/Allergy/Add-Allergy";
import ItemAllergy from "./pages/Allergy/Item-Allergy";
import Categories from "./pages/Categories";
import StoreTiming from "./pages/storeTiming";
import Discount from "./pages/Discount";
import PostCode from "./pages/PostCode";

import Inventory from "./pages/Inventory";
import Customer from "./pages/Customer";
import CustomerDetail from "./pages/CustomerDetail";
import DeliveryZone from "./pages/Delivery-Zone";
import DeviceStatus from "./pages/Device-Status";
import Delivery from "./pages/Delivery";
import StoreDetails from "./pages/SuperAdmin/StoreDetails/AllStore";
import StoreProfile from "./pages/SuperAdmin/StoreDetails/AllStorProfile";
import OrderPage from "./pages/Orders/Orders";
import ChangePasswordPage from "./pages/Change_Password";
import PaymentSettings from "./pages/Payment-Settings";
import SuperAdminDashboard from "./pages/SuperAdmin/DashBoard/Dashboard";
import StoreConfigPage from "./pages/SuperAdmin/StoreConfig/StoreConfig";
import StoreConfigFormPage from "./pages/SuperAdmin/StoreConfig/StoreConfigForm";
import StoreSetting from "./pages/StoreSetting";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 5 * 60 * 1000, // 5 minutes until data is considered "stale"
    },
  },
});

const ProtectedRoute = () => {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const token = getSessionAdminToken();

  if (!isAuthenticated && !token) {
    return <Navigate to="/admin-login" replace />;
  }
  return <Outlet />;
};

function App() {
  const loadFromStorage = useAdminStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/test">
          <NavigateSetter />
          <Routes>
            <Route path="/" element={<Navigate to="/admin-login" replace />} />
            <Route path="/admin-login" element={<Login />} />

            {/* ✅ Sab routes ek hi AdminLayout ke andar */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AdminLayout />}>
                <Route index path="dashboard" element={<Dashboard />} />
                <Route path="tax" element={<Tax />} />
                <Route path="product/category" element={<Category />} />
                <Route path="product/products" element={<Product />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="product/toppings" element={<Toppings />} />
                <Route
                  path="product/topping-groups"
                  element={<ToppingGroups />}
                />
                <Route path="product/group-item" element={<GroupItem />} />
                <Route
                  path="product/variant-groups"
                  element={<VariantGroups />}
                />
                <Route path="allergy/add-allergy" element={<AddAllergy />} />
                <Route path="allergy/item-allergy" element={<ItemAllergy />} />
                <Route path="category" element={<Categories />} />
                <Route path="store-timing" element={<StoreTiming />} />
                <Route path="store-settings" element={<StoreSetting />} />
                <Route path="discount" element={<Discount />} />
                <Route path="postcode" element={<PostCode />} />
                <Route path="delivery-zone" element={<DeliveryZone />} />
                <Route path="delivery" element={<Delivery />} />
                <Route path="device-status" element={<DeviceStatus />} />
                <Route path="customer" element={<Customer />} />
                <Route path="customer/:id" element={<CustomerDetail />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="store-profile" element={<StoreProfile />} />
                <Route path="orders" element={<OrderPage />} />
                <Route
                  path="change-password"
                  element={<ChangePasswordPage />}
                />
                <Route path="payment-settings" element={<PaymentSettings />} />
                {/* Super Admin Routes */}
                <Route path="super/store-details" element={<StoreDetails />} />
                <Route
                  index
                  path="super/dashboard"
                  element={<SuperAdminDashboard />}
                />
                <Route
                  path="super/store-config"
                  element={<StoreConfigPage />}
                />
                <Route
                  path="super/store-config/form"
                  element={<StoreConfigFormPage />}
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
