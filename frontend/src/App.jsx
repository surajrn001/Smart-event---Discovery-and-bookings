import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatbotWidget } from './components/ChatbotWidget';

import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { BookingHistoryPage } from './pages/BookingHistoryPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PaymentCheckoutPage } from './pages/PaymentCheckoutPage';
import { PaymentConfirmationPage } from './pages/PaymentConfirmationPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';

// Organizer Pages
import { ManageEventsPage } from './pages/organizer/ManageEventsPage';
import { CreateEventPage } from './pages/organizer/CreateEventPage';
import { EditEventPage } from './pages/organizer/EditEventPage';
import { EventBookingsPage } from './pages/organizer/EventBookingsPage';
import { OrganizerAnalyticsPage } from './pages/organizer/OrganizerAnalyticsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <WishlistProvider>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F6F8' }}>
              <Navbar />
              <main style={{ flexGrow: 1 }}>
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Checkout & Payment Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <PaymentCheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment-confirmation"
                    element={
                      <ProtectedRoute>
                        <PaymentConfirmationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/confirmation"
                    element={
                      <ProtectedRoute>
                        <PaymentConfirmationPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* User Protected Pages */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <BookingHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Organizer Protected Routes */}
                  <Route
                    path="/organizer/events"
                    element={
                      <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                        <ManageEventsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/organizer/events/new"
                    element={
                      <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                        <CreateEventPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/organizer/events/:id/edit"
                    element={
                      <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                        <EditEventPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/organizer/events/:id/bookings"
                    element={
                      <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                        <EventBookingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/organizer/analytics"
                    element={
                      <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                        <OrganizerAnalyticsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* AI Chatbot Assistant Widget */}
              <ChatbotWidget />

              {/* Main Application Footer */}
              <footer style={{
                background: '#1F2533',
                borderTop: '1px solid #2B3148',
                padding: '32px 20px',
                color: '#94A3B8',
                fontSize: '13px',
                marginTop: 'auto',
              }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: '800', fontSize: '18px' }}>
                    Smart<span style={{ color: '#F84464' }}>Event</span>
                  </div>
                  <p style={{ maxWidth: '600px', margin: '0 auto', color: '#64748B', lineHeight: '1.6' }}>
                    India's Premier Event Discovery, Digital Pass & Ticketing Platform. Secure payments with instant QR passes.
                  </p>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#E2E8F0' }}>© 2026 SmartEvent Entertainment Pvt. Ltd.</span>
                    <span>Terms & Conditions</span>
                    <span>Privacy Policy</span>
                    <span>Support 24/7</span>
                  </div>
                </div>
              </footer>
            </div>
          </WishlistProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;
