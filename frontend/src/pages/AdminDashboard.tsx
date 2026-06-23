import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { RippleButton } from '@/components/ui/ripple-button';
import { Toast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Eye,
  RefreshCw,
  LogOut
} from 'lucide-react';

interface Report {
  id: string;
  childName: string;
  age: number;
  gender: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  lastSeenTime: string;
  description: string;
  contactName: string;
  contactPhone: string;
  photoUrl?: string;
  status: string;
  createdAt: string;
}

interface Stats {
  pendingCount: number;
  activeCount: number;
  solvedCount: number;
  sightingsCount: number;
}

export function AdminDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [approvedReports, setApprovedReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({ pendingCount: 0, activeCount: 0, solvedCount: 0, sightingsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pending, approved, statsData] = await Promise.all([
        api.getReports('pending'),
        api.getReports('approved'),
        api.getStats(),
      ]);

      setPendingReports(pending as any);
      setApprovedReports(approved as any);
      setStats(statsData as any);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId: string) => {
    try {
      await api.approveReport(reportId, token || '');
      setToast({ show: true, message: 'Report approved and published!', type: 'success' });
      fetchData();
    } catch (error) {
      setToast({ show: true, message: 'Failed to approve report', type: 'error' });
    }
  };

  const handleReject = async (reportId: string) => {
    try {
      await api.rejectReport(reportId, token || '');
      setToast({ show: true, message: 'Report rejected', type: 'info' });
      fetchData();
    } catch (error) {
      setToast({ show: true, message: 'Failed to reject report', type: 'error' });
    }
  };

  const handleSolve = async (reportId: string) => {
    try {
      await api.solveReport(reportId, token || '');
      setToast({ show: true, message: 'Case marked as solved!', type: 'success' });
      fetchData();
    } catch (error) {
      setToast({ show: true, message: 'Failed to update report', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {user ? `Welcome, ${user.username}` : 'Manage and verify missing child reports'}
            </p>
          </div>
          <div className="flex gap-2">
            <RippleButton variant="ghost" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </RippleButton>
            <RippleButton variant="hoverborder" hoverBorderEffectColor="#ef4444" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </RippleButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Pending"
            value={stats.pendingCount}
            color="text-amber-500"
            bgColor="bg-amber-500/10"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            label="Active Alerts"
            value={stats.activeCount}
            color="text-red-500"
            bgColor="bg-red-500/10"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Solved"
            value={stats.solvedCount}
            color="text-green-500"
            bgColor="bg-green-500/10"
          />
          <StatCard
            icon={<Eye className="w-6 h-6" />}
            label="Sightings"
            value={stats.sightingsCount}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'pending'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'approved'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({approvedReports.length})
          </button>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : activeTab === 'pending' ? (
          <div className="space-y-4">
            {pendingReports.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">No pending reports to review</p>
              </Card>
            ) : (
              pendingReports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  actions={
                    <>
                      <RippleButton
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(report.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </RippleButton>
                      <RippleButton
                        variant="hoverborder"
                        hoverBorderEffectColor="#dc2626"
                        onClick={() => handleReject(report.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </RippleButton>
                    </>
                  }
                />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {approvedReports.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No active alerts</p>
              </Card>
            ) : (
              approvedReports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  actions={
                    <RippleButton
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleSolve(report.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Solved
                    </RippleButton>
                  }
                />
              ))
            )}
          </div>
        )}

        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgColor} ${color}`}>{icon}</div>
          <div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportCard({ report, actions }: { report: Report; actions: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {report.photoUrl ? (
            <img
              src={report.photoUrl}
              alt={report.childName}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-lg">{report.childName}</h3>
                <p className="text-sm text-muted-foreground">
                  {report.age} years old, {report.gender}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                Submitted: {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-2 text-sm mb-3">
              <p className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {report.lastSeenLocation}
              </p>
              <p className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {report.lastSeenDate} at {report.lastSeenTime}
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{report.description}</p>

            <div className="text-sm text-muted-foreground mb-4">
              Contact: {report.contactName} - {report.contactPhone}
            </div>

            <div className="flex gap-2">{actions}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
