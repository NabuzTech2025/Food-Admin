import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./pages/Layout";
import Login from "./pages/Login";
import { useAdminStore } from "./context/store/useAdminStore";
import { useEffect } from "react";
import Tax from "./pages/Tax";
import Category from "./pages/Product/Category";
import Product from "./pages/Product/Product";
import Toppings from "./pages/Product/Toppings";
import ToppingGroups from "./pages/Product/ToppingGroups";
import GroupItem from "./pages/Product/GroupItem";
import VariantGroups from "./pages/Product/Variant-groups";
import DeliveryZonePage from "./pages/Delivery_Zone";
function App() {
  const queryClient = new QueryClient();
  const loadFromStorage = useAdminStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, []);
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/admin-login" replace />} />
            <Route path="/admin-login" element={<Login />} />
            {/* Admin Layout Routes */}
            <Route
              path="/admin"
              element={
                // <ProtectedRoute userType={["ADMIN"]}>
                <AdminLayout />
                // </ProtectedRoute>
              }
            >
              <Route index path="dashboard" element={<Dashboard />} />
              <Route path="tax" element={<Tax />} />
              <Route path="product/category" element={<Category />} />
              <Route path="product/products" element={<Product />} />
              <Route path="product/toppings" element={<Toppings />} />
              <Route
                path="product/topping-groups"
                element={<ToppingGroups />}
              />
              <Route path="product/group-item" element={<GroupItem />} />{" "}
              <Route
                path="product/variant-groups"
                element={<VariantGroups />}
              />
              <Route path="delivery-zone" element={<DeliveryZonePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
