import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import AddHotel from "./pages/AddHotel";
import { useAppContext } from "./context/AppContext";
import MyHotels from "./pages/MyHotels";
import EditHotel from "./pages/EditHotel";
import Search from "./pages/Search";
import Detail from "./pages/Detail";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBooking";
import Wishlist from "./pages/Wishlist";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

const App = () => {
  const { isLoggedIn, userRole } = useAppContext();
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <Search />
            </Layout>
          }
        />
        <Route
          path="/detail/:hotelId"
          element={
            <Layout>
              <Detail />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/sign-in"
          element={
            <Layout>
              <SignIn />
            </Layout>
          }
        />

        {isLoggedIn && <>
          <Route path="/hotel/:hotelId/booking" element={
            <Layout>
              <Booking />
            </Layout>
          } />

          <Route path="/add-hotel" element={
            <Layout>
              <AddHotel />
            </Layout>
          } />

          <Route path="/edit-hotel/:hotelId" element={
            <Layout>
              <EditHotel />
            </Layout>
          } />

          <Route path="/my-hotels" element={
            <Layout>
              <MyHotels />
            </Layout>
          } />

          <Route path="/my-bookings" element={
            <Layout>
              <MyBookings />
            </Layout>
          } />

          <Route
            path="/wishlist"
            element={
              <Layout>
                <Wishlist />
              </Layout>
            }
          />

          <Route path="/profile" element={
            <Layout>
              <Profile />
            </Layout>
          } />

          <Route path="/change-password" element={
            <Layout>
              <ChangePassword />
            </Layout>
          } />
        </>}

        {isLoggedIn && userRole === "admin" && (
          <>
            <Route
              path="/admin/dashboard"
              element={
                <Layout>
                  <AdminDashboard />
                </Layout>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <Layout>
                  <AdminBookings />
                </Layout>
              }
            />
          </>
        )}

        <Route
          path="/payment-success"
          element={
            <Layout>
              <PaymentSuccess />
            </Layout>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router >
  );
};

export default App;
