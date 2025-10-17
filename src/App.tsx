
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { GoogleMapProvider } from './contexts/GoogleMapContext';
import JourneyTracker from './components/JourneyTracker';
import BehaviorTracker from './components/BehaviorTracker';

import { ModelGenerationProvider } from './contexts/ModelGeneration';
import { Toaster } from './components/ui/toaster';

import React, { Suspense, lazy } from 'react';
import BottomNavBar from './components/BottomNavBar';
import { InstallPrompt } from './components/InstallPrompt';

// Page imports
import Index from './pages/Index';
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
import ModelViewerWrapper from './components/model-viewer/ModelViewerWrapper';
const OnboardingChatbot = lazy(() => import('./pages/OnboardingChatbot'));
const EnhancedOnboardingChatbot = lazy(() => import('./pages/EnhancedOnboardingChatbot'));
const AddAsset = lazy(() => import('./pages/AddAsset'));
const RooftopDashboard = lazy(() => import('./pages/RooftopDashboard'));
const EVChargingDashboard = lazy(() => import('./pages/EVChargingDashboard'));
const InternetDashboard = lazy(() => import('./pages/InternetDashboard'));
const ParkingDashboard = lazy(() => import('./pages/ParkingDashboard'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const AffiliateEarningsDashboard = lazy(() => import('./pages/AffiliateEarningsDashboard'));
const SubmitProperty = lazy(() => import('./pages/SubmitProperty'));
const Options = lazy(() => import('./pages/Options'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const ManageAssets = lazy(() => import('./pages/ManageAssets'));
const NewAddress = lazy(() => import('./pages/NewAddress'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <GoogleMapProvider>
            <ModelGenerationProvider>
              <JourneyTracker />
              <BehaviorTracker />
              <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/new-address" element={<NewAddress />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/manage" element={<ManageAssets />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                  <Route path="/dashboard/add-asset" element={<AddAsset />} />
                  <Route path="/dashboard/rooftop" element={<RooftopDashboard />} />
                  <Route path="/dashboard/ev-charging" element={<EVChargingDashboard />} />
                  <Route path="/dashboard/internet" element={<InternetDashboard />} />
                  <Route path="/dashboard/parking" element={<ParkingDashboard />} />
                  <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/dashboard/affiliate" element={<AffiliateEarningsDashboard />} />
                  <Route path="/dashboard/onboarding" element={<EnhancedOnboardingChatbot />} />
                  <Route path="/dashboard/settings" element={<SettingsPage />} />
                  <Route path="/dashboard/account" element={<AccountPage />} />
                  <Route path="/model-viewer" element={<ModelViewerWrapper />} />
                  <Route path="/chatbot" element={<OnboardingChatbot />} />
                  <Route path="/submit-property" element={<SubmitProperty />} />
                  <Route path="/options" element={<Options />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <BottomNavBar />
              <InstallPrompt />
              <Toaster />
            </ModelGenerationProvider>
          </GoogleMapProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
