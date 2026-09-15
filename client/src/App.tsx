import { Link } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthOutlet } from "./components/Protected";
import { Icon } from "./lib/icons";
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
import Prototype from "./pages/Prototype";
import Wallet from "./pages/Wallet";
import Notifications from "./pages/Notifications";
import Admin from "./pages/Admin";
import Campus from "./pages/Campus";
import Launch from "./pages/Launch";

export default function App() {
  return (
    <Routes>
      <Route path="/launch" element={<Launch />} />
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
        <Route path="/prototype" element={<Prototype />} />
        <Route path="/campus" element={<Campus />} />
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
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={
          <div className="empty" style={{ padding: 90 }}>
            <div className="big"><Icon name="location" size={48} color="var(--brand)" /></div>
            <h3>This page wandered off campus</h3>
            <p>The page you're looking for doesn't exist.</p>
            <Link to="/" className="btn btn-primary">Go home</Link>
            <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/browse" className="btn btn-outline btn-sm">Browse market</Link>
              <Link to="/events" className="btn btn-outline btn-sm">Campus events</Link>
              <Link to="/launch" className="btn btn-outline btn-sm">Product overview</Link>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
}
