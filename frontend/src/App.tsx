import { Routes, Route } from 'react-router-dom';
import { Header } from '@/components/ui/header';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { HomePage } from '@/pages/HomePage';
import { AlertsPage } from '@/pages/AlertsPage';
import { SubmitReportPage } from '@/pages/SubmitReportPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { SightingPage } from '@/pages/SightingPage';
import { LoginPage } from '@/pages/LoginPage';
import { WatcherRegisterPage } from '@/pages/WatcherRegisterPage';
import { ReportDetailPage } from '@/pages/ReportDetailPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/submit-report" element={<SubmitReportPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/watcher-register" element={<WatcherRegisterPage />} />
              <Route path="/report/:id" element={<ReportDetailPage />} />
              <Route path="/sighting/:reportId" element={<SightingPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </SocketProvider>
  </AuthProvider>
  );
}

function Footer() {
  return (
    <footer className="border-t py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-muted-foreground text-sm">
          Bharat Alert - A community-powered child safety initiative
        </p>
        <p className="text-muted-foreground text-xs mt-2">
          In case of emergency, contact local authorities immediately
        </p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <a href="#" className="text-muted-foreground hover:text-foreground">About</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">Contact</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

export default App;
