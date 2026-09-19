import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Verify from "./pages/Register/Verify";
import UsersPage from "./pages/admin/Users/UsersPage";
import AdminWishlistsPage from "./pages/admin/Wishlists/AdminWishlistsPage";
import AdminPaymentsPage from "./pages/admin/Payments/AdminPaymentsPage";
import WishlistsPage from "./pages/user/Wishlists/WishlistsPage";
import WishlistDetailPage from "./pages/user/Wishlists/WishlistDetailPage";
import RetryPage from "./pages/user/Payments/RetryPage";
import SupportPage from "./pages/user/Support/SupportPage";
import AdminTicketsPage from "./pages/admin/Support/AdminTicketsPage";
import Error from "./pages/Error/Error";

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <Error />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/register/verify", element: <Verify /> },

      // User routes
      {
        path: "/wishlists",
        element: (
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <WishlistsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/wishlists/:id",
        element: (
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <WishlistDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/support",
        element: (
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <SupportPage />
          </ProtectedRoute>
        ),
      },

      // Public payment retry route — no ProtectedRoute, backend route has
      // no auth middleware and the user may not be logged in here.
      { path: "/payments/:id/retry", element: <RetryPage /> },

      // Admin routes
      {
        path: "/admin/users",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/wishlists",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminWishlistsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/payments",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPaymentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/tickets",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminTicketsPage />
          </ProtectedRoute>
        ),
      },

      { path: "*", element: <Error /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
