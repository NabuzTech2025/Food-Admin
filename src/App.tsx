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
import AddAllergy from "./pages/Allergy/Add-Allergy";
import ItemAllergy from "./pages/Allergy/Item-Allergy";
import Categories from "./pages/Categories";
import StoreSettings from "./pages/Store-Settings";
import Discount from "./pages/Discount";
import PostCode from "./pages/PostCode";

import Inventory from "./pages/Inventory";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 5 * 60 * 1000, // 5 minutes until data is considered "stale"
    },
  },
});

function App() {
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

            {/* ✅ Sab routes ek hi AdminLayout ke andar */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index path="dashboard" element={<Dashboard />} />
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
              <Route path="category" element={<Categories />} />
              <Route path="store-settings" element={<StoreSettings />} />
              <Route path="discount" element={<Discount />} />
              <Route path="postcode" element={<PostCode />} />
              <Route path="inventory" element={<Inventory />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
