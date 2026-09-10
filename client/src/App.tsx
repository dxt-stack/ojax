import { Link } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthOutlet } from "./components/Protected";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import Login, { Register, ForgotPassword, ResetPassword } from "./pages/Auth";
import Sell from "./pages/Sell";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Events, { EventDetail } from "./pages/Events";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import StaticPage from "./pages/Static";
import DesignSystem from "./pages/DesignSystem";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/item/:id" element={<ListingDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<StaticPage page="about" />} />
        <Route path="/safety" element={<StaticPage page="safety" />} />
        <Route path="/help" element={<StaticPage page="help" />} />
        <Route path="/contact" element={<StaticPage page="contact" />} />
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/profile/:id?" element={<Profile />} />

        <Route element={<AuthOutlet />}>
          <Route path="/sell" element={<Sell />} />
          <Route path="/sell/:id/edit" element={<Sell />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/org" element={<Dashboard />} />
        </Route>

        <Route path="*" element={
          <div className="empty" style={{ padding: 90 }}>
            <div className="big"></div>
            <h3>This page wandered off campus</h3>
            <p>The page you're looking for doesn't exist.</p>
            <Link to="/" className="btn btn-primary">Go home</Link>
          </div>
        } />
      </Route>
    </Routes>
  );
}
