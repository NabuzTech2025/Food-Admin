import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Outlet,
  useNavigate,
} from "react-router-dom";
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
import DeviceStatus from "./pages/SuperAdmin/Device-Status";
import Delivery from "./pages/Delivery";
import StoreDetails from "./pages/SuperAdmin/StoreDetails/AllStore";
import StoreProfile from "./pages/SuperAdmin/StoreDetails/StoreProfile";
import StoreSEO from "./pages/SuperAdmin/StoreDetails/StoreSEO";
import StoreLegalPages from "./pages/SuperAdmin/StoreDetails/StoreLegalPages";
import StoreLegalPageForm from "./pages/SuperAdmin/StoreDetails/StoreLegalPageForm";
import OrderPage from "./pages/Orders/Orders";
import ChangePasswordPage from "./pages/Change_Password";
import PaymentSettings from "./pages/SuperAdmin/Payment-Settings/Payment-Settings";
import SuperAdminDashboard from "./pages/SuperAdmin/DashBoard/Dashboard";
import StoreConfigPage from "./pages/SuperAdmin/StoreConfig/StoreConfig";
import StoreConfigFormPage from "./pages/SuperAdmin/StoreConfig/StoreConfigForm";
import StoreSetting from "./pages/StoreSetting";
import StoreLayout from "./pages/SuperAdmin/StoreLayout";
import Orders from "./pages/Orders/Orders";
import Reservation from "./pages/Reservation/Reservation";
import Settings from "./pages/SuperAdmin/Settings/Settings";
// import Reservation from "./pages/SuperAdmin/Reservation";
import AdminReservation from "./pages/AdminReservation";

// ✅ Store-scoped page imports (create these pages as needed)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/test">
        <NavigateSetter />
        <Routes>
          <Route path="/" element={<Navigate to="/admin-login" replace />} />
          <Route path="/admin-login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            {/* ─── Existing AdminLayout — completely unchanged ─── */}
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
              <Route path="orders" element={<OrderPage />} />
              <Route path="reservations" element={<AdminReservation />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="payment-settings" element={<PaymentSettings />} />

              {/* Super Admin Routes */}
              <Route path="super/store-details" element={<StoreDetails />} />
              <Route
                index
                path="super/dashboard"
                element={<SuperAdminDashboard />}
              />
              <Route path="super/store-config" element={<StoreConfigPage />} />
              <Route
                path="super/store-config/form"
                element={<StoreConfigFormPage />}
              />
              <Route path="super/reservations" element={<Reservation />} />
              <Route path="super/device-status" element={<DeviceStatus />} />
              <Route path="super/store-profile" element={<StoreProfile />} />
            </Route>

            {/* ─── ✅ NEW: StoreLayout — only when clicking a store ─── */}
            <Route path="super/stores/:storeId" element={<StoreLayout />}>
              <Route index element={<Navigate to="orders" replace />} />
              <Route path="orders" element={<Orders />} />
              <Route path="reservations" element={<AdminReservation />} />
              <Route path="tax" element={<Tax />} />
              <Route path="product/category" element={<Category />} />
              <Route path="product/products" element={<Product />} />
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
              <Route path="coupons" element={<Coupons />} />
              <Route path="category" element={<Categories />} />
              <Route path="store-timing" element={<StoreTiming />} />
              <Route path="discount" element={<Discount />} />
              <Route path="postcode" element={<PostCode />} />
              <Route path="delivery-zone" element={<DeliveryZone />} />
              <Route path="delivery" element={<Delivery />} />
              <Route path="customer" element={<Customer />} />
              <Route path="customer/:id" element={<CustomerDetail />} />
              <Route path="payments" element={<PaymentSettings />} />
              <Route path="store-profile" element={<StoreProfile />} />
              <Route path="seo" element={<StoreSEO />} />
              <Route path="legal-pages" element={<StoreLegalPages />} />
              <Route path="legal-pages/form" element={<StoreLegalPageForm />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
