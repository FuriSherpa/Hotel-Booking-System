import {
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import Layout1 from "./layouts/Layout1";
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
import AdminBookings from "./pages/AdminBooking";
import Wishlist from "./pages/Wishlist";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import { Toaster } from 'react-hot-toast';
import AdminHome from './pages/AdminHome';
import AdminUsers from "./pages/AdminUsers";
import UserDetails from './pages/UserDetails';

const App = () => {
  const { isLoggedIn, userRole } = useAppContext();
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              {userRole === "admin" ? <AdminHome /> : <Home />}
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
            <Layout1>
              <Profile />
            </Layout1>
          } />

          <Route path="/change-password" element={
            <Layout1>
              <ChangePassword />
            </Layout1>
          } />
        </>}

        {isLoggedIn && userRole === "admin" && (
          <>
            <Route
              path="/admin/bookings"
              element={
                <Layout1>
                  <AdminBookings />
                </Layout1>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Layout1>
                  <AdminUsers />
                </Layout1>
              }
            />
            <Route
              path="/admin/users/:userId"
              element={
                <Layout1>
                  <UserDetails />
                </Layout1>
              }
            />
          </>
        )}

        <Route
          path="/payment-success"
          element={
            <PaymentSuccess />
          }
        />

      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: '#f0fdf4',
              border: '1px solid #22c55e',
              padding: '16px',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              border: '1px solid #ef4444',
              padding: '16px',
            },
          },
        }}
      />
    </Router >
  );
};

export default App;
