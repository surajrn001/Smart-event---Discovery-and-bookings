import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { BookingHistoryPage } from './pages/BookingHistoryPage';
import { NotificationsPage } from './pages/NotificationsPage';

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
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flexGrow: 1 }}>
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* User Protected Pages */}
                <Route
                  path="/confirmation"
                  element={
                    <ProtectedRoute>
                      <ConfirmationPage />
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

            <footer style={{
              background: '#ffffff',
              borderTop: '1px solid #e5e7eb',
              padding: '16px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '13px',
              marginTop: 'auto',
            }}>
              <p>SmartEvent Platform – Event Discovery, Organizer Management & Admin Analytics</p>
            </footer>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
