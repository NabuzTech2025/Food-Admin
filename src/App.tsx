import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/StoreDashboard/Dashboard/Dashboard";
import AdminLayout from "./pages/StoreDashboard/Layout";
import Login from "./pages/StoreDashboard/Login";
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
import Tax from "./pages/StoreDashboard/Tax";
import Category from "./pages/StoreDashboard/Product/Category";
import Product from "./pages/StoreDashboard/Product/Product";
import Toppings from "./pages/StoreDashboard/Product/Toppings";
import ToppingGroups from "./pages/StoreDashboard/Product/ToppingGroups";
import GroupItem from "./pages/StoreDashboard/Product/GroupItem";
import VariantGroups from "./pages/StoreDashboard/Product/Variant-groups";
import Coupons from "./pages/StoreDashboard/Product/Coupons";
import AddAllergy from "./pages/StoreDashboard/Allergy/Add-Allergy";
import ItemAllergy from "./pages/StoreDashboard/Allergy/Item-Allergy";
import Categories from "./pages/StoreDashboard/Categories";
import StoreTiming from "./pages/StoreDashboard/storeTiming";
import Discount from "./pages/StoreDashboard/Discount";
import PostCode from "./pages/StoreDashboard/PostCode";
import Inventory from "./pages/StoreDashboard/Inventory";
import Customer from "./pages/StoreDashboard/Customer";
import CustomerDetail from "./pages/StoreDashboard/CustomerDetail";
import DeliveryZone from "./pages/StoreDashboard/Delivery-Zone";
import DeviceStatus from "./pages/SuperAdmin/Device-Status";
import Delivery from "./pages/StoreDashboard/Delivery";
import StoreDetails from "./pages/SuperAdmin/StoreDetails/AllStore";
import StoreProfile from "./pages/SuperAdmin/StoreDetails/StoreProfile";
import StoreSEO from "./pages/SuperAdmin/StoreDetails/StoreSEO";
import StoreLegalPages from "./pages/SuperAdmin/StoreDetails/StoreLegalPages";
import StoreLegalPageForm from "./pages/SuperAdmin/StoreDetails/StoreLegalPageForm";
import OrderPage from "./pages/StoreDashboard/Orders/Orders";
import ChangePasswordPage from "./pages/StoreDashboard/Change_Password";
import PaymentSettings from "./pages/SuperAdmin/Payment-Settings/Payment-Settings";
import SuperAdminDashboard from "./pages/SuperAdmin/DashBoard/Dashboard";
import StoreConfigPage from "./pages/SuperAdmin/StoreConfig/StoreConfig";
import StoreConfigFormPage from "./pages/SuperAdmin/StoreConfig/StoreConfigForm";
import StoreSetting from "./pages/StoreDashboard/StoreSetting";
import StoreLayout from "./pages/SuperAdmin/StoreLayout";
import Orders from "./pages/StoreDashboard/Orders/Orders";
import Reservation from "./pages/StoreDashboard/Reservation/Reservation";
import Settings from "./pages/SuperAdmin/Settings/Settings";
// import Reservation from "./pages/SuperAdmin/Reservation";
import AdminReservation from "./pages/StoreDashboard/AdminReservation";
import ReservationLayout from "./pages/ReservationDashboard/ReservationLayout";
import ReservationOverview from "./pages/ReservationDashboard/Overview";
import ReservationBookings from "./pages/ReservationDashboard/Bookings";
import ReservationSettings from "./pages/ReservationDashboard/Settings";

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
      <BrowserRouter basename="/admin">
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

            {/* ─── Reservation owner dashboard (its own layout) ─── */}
            <Route path="reservation-dashboard" element={<ReservationLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ReservationOverview />} />
              <Route path="bookings" element={<ReservationBookings />} />
              <Route path="settings" element={<ReservationSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
