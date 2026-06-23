import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InteractiveMap, useMapData } from '@/components/ui/interactive-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RippleButton } from '@/components/ui/ripple-button';
import { AlertTriangle, MapPin, Clock, User, RefreshCw, Eye } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';

interface Report {
  id: string;
  childName: string;
  age: number;
  gender: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  lastSeenTime: string;
  description: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export function AlertsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { points, loading: mapLoading, refetch } = useMapData();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Array<{id: string, childName: string, location: string}>>([]);
  
  const { token } = useAuth();
  const { socket, on } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();

    // Listen for new alerts
    if (socket) {
      on('new_alert', (alert: { id: string; childName: string; location: string }) => {
        // Show toast
        showToast(`⚠️ New Alert Nearby: ${alert.childName} last seen at ${alert.location}`, 'warning');
        
        // Add to recent alerts (keep last 5)
        setRecentAlerts(prev => {
          const updated = [...prev, alert];
          return updated.slice(-5); // Keep only last 5 alerts
        });
      });
      
      // Optional: listen for report approved for optimistic updates
      on('report_approved', (report: Report) => {
        setReports(prev => {
          // Avoid duplicates
          if (!prev.some(r => r.id === report.id)) {
            return [...prev, report];
          }
          return prev;
        });
      });
      
      // Optional: listen for new sightings
      on('new_sighting', (sighting: { reportId: string; location: string }) => {
        // Update report if needed - for now just show in recent alerts
        const report = reports.find(r => r.id === sighting.reportId);
        if (report) {
          showToast(`👀 New sighting for ${report.childName} at ${sighting.location}`, 'info');
        }
      });
    }

    // Cleanup
    return () => {
      if (socket) {
        // Note: SocketContext handles cleanup automatically
      }
    };
  }, [socket, on, showToast, reports.length]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports?status=approved');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePointClick = (point: { id: string }) => {
    const report = reports.find(r => r.id === point.id);
    if (report) setSelectedReport(report);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
           <h1 className="text-3xl font-bold flex items-center gap-2">
             <AlertTriangle className="w-8 h-8 text-red-500" />
             Active Alerts
           </h1>
           <p className="text-muted-foreground mt-1">
             {reports.length} active missing child reports
           </p>
         </div>
         <div className="flex gap-2">
           <RippleButton variant="ghost" onClick={() => { fetchReports(); refetch(); }}>
             <RefreshCw className="w-4 h-4 mr-2" />
             Refresh
           </RippleButton>
           <Link to="/submit-report">
             <RippleButton variant="default" className="bg-red-600 hover:bg-red-700">
               Report Missing Child
             </RippleButton>
           </Link>
         </div>
       </div>

       {/* Recent Alerts Toast Container (for visual reference) */}
       {recentAlerts.length > 0 && (
         <div className="mb-6">
           <h2 className="text-xl font-semibold mb-2">Recent Alerts</h2>
           <div className="space-y-2">
             {recentAlerts.map((alert, index) => (
               <div key={alert.id} className="px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                 <div className="flex justify-between items-start">
                   <div className="font-medium">⚠️ {alert.childName}</div>
                   <div className="text-xs text-red-600 dark:text-red-400">#{recentAlerts.length - index}</div>
                 </div>
                 <p className="mt-1 text-sm text-muted-foreground">Last seen at: {alert.location}</p>
               </div>
             ))}
           </div>
         </div>
       )}

       {/* Map and List */}
       <div className="grid lg:grid-cols-2 gap-6">
          {/* Map */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Live Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] rounded-lg overflow-hidden">
                {mapLoading ? (
                  <div className="h-full flex items-center justify-center bg-muted">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <InteractiveMap
                    points={points}
                    onPointClick={handlePointClick}
                    zoom={5}
                  />
                )}
              </div>
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Missing Child</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Sighting</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No active alerts at the moment.</p>
              </Card>
            ) : (
              reports.map(report => (
                <AlertCard
                  key={report.id}
                  report={report}
                  isSelected={selectedReport?.id === report.id}
                  onClick={() => setSelectedReport(report)}
                />
              ))
            )}
          </div>
        </div>

        {/* Selected Report Modal */}
        {selectedReport && (
          <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
        )}
      </div>
    </div>
  );
}

function AlertCard({
  report,
  isSelected,
  onClick,
}: {
  report: Report;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-red-500' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {report.photoUrl ? (
            <img
              src={report.photoUrl}
              alt={report.childName}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{report.childName}</h3>
                <p className="text-sm text-muted-foreground">
                  {report.age} years old, {report.gender}
                </p>
              </div>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs font-medium rounded">
                ACTIVE
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {report.lastSeenLocation}
              </p>
              <p className="text-sm flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {report.lastSeenDate} at {report.lastSeenTime}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportModal({ report, onClose }: { report: Report; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{report.childName}</h2>
            <RippleButton variant="ghost" className="p-2" onClick={onClose}>
              ✕
            </RippleButton>
          </div>

          {report.photoUrl && (
            <img
              src={report.photoUrl}
              alt={report.childName}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}

          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Age & Gender</p>
              <p className="font-medium">{report.age} years old, {report.gender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Seen Location</p>
              <p className="font-medium">{report.lastSeenLocation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Seen Date & Time</p>
              <p className="font-medium">{report.lastSeenDate} at {report.lastSeenTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{report.description}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Link to={`/sighting/${report.id}`} className="flex-1">
              <RippleButton variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                <Eye className="w-4 h-4 mr-2" />
                Report Sighting
              </RippleButton>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
