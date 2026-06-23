import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InteractiveMap } from '@/components/ui/interactive-map';
import { useAuth } from '@/contexts/AuthContext';

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [report, setReport] = useState<any>(null);
  const [sightings, setSightings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportData, sightingsData] = await Promise.all([
          api.getReport(Number(id)),
          api.getSightings(Number(id)),
        ]);
        setReport(reportData);
        setSightings(sightingsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load report details');
        showToast('Failed to load report details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, showToast]);

  const isAdmin = user?.role === 'admin';

  const handleApprove = async () => {
    try {
      await api.approveReport(Number(id), token || '');
      showToast('Report approved successfully', 'success');
      // Refresh the report data
      const updatedReport = await api.getReport(Number(id));
      setReport(updatedReport);
    } catch (err: any) {
      showToast(err.message || 'Failed to approve report', 'error');
    }
  };

  const handleReject = async () => {
    try {
      await api.rejectReport(Number(id), token || '');
      showToast('Report rejected', 'info');
      navigate('/admin');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject report', 'error');
    }
  };

  const handleSolve = async () => {
    try {
      await api.solveReport(Number(id), token || '');
      showToast('Report marked as solved', 'success');
      // Refresh the report data
      const updatedReport = await api.getReport(Number(id));
      setReport(updatedReport);
    } catch (err: any) {
      showToast(err.message || 'Failed to solve report', 'error');
    }
  };

  if (loading) return <div className="flex h-[600px] items-center justify-center">Loading...</div>;
  if (error) return <div className="flex h-[600px] items-center justify-center text-destructive">{error}</div>;
  if (!report) return <div className="flex h-[600px] items-center justify-center">Report not found</div>;

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const mapPoints = [
    {
      id: String(report.id),
      latitude: report.lat,
      longitude: report.lon,
      childName: report.child_name,
      age: report.age,
      lastSeenLocation: report.last_seen_location,
      createdAt: report.submitted_at,
    },
    ...sightings.map((s: any) => ({
      id: String(s.id),
      latitude: s.lat,
      longitude: s.lon,
      location: s.description,
      type: 'sighting',
      createdAt: s.submitted_at,
    })),
  ];

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8">
          {/* Report Header */}
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{report.child_name}</CardTitle>
                  <p className="text-muted-foreground">Age: {report.age}</p>
                </div>
                <div className="px-3 py-1 rounded-full text-sm font-medium">
                  {report.status === 'solved' && (
                    <span className="bg-green-100 text-green-800">Solved</span>
                  )}
                  {report.status === 'approved' && (
                    <span className="bg-blue-100 text-blue-800">Approved</span>
                  )}
                  {report.status === 'rejected' && (
                    <span className="bg-red-100 text-red-800">Rejected</span>
                  )}
                  {report.status === 'pending' && (
                    <span className="bg-yellow-100 text-yellow-800">Pending</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p><strong>Last Seen Location:</strong> {report.last_seen_location}</p>
                <p><strong>Reporter:</strong> {report.reporter_name}</p>
                <p><strong>Contact:</strong> {report.reporter_contact}</p>
                {report.photo_url && (
                  <div className="mt-2">
                    <img 
                      src={report.photo_url} 
                      alt={`${report.child_name}'s photo`} 
                      className="max-w-xs rounded-lg shadow-sm"
                    />
                  </div>
                )}
                <p><strong>Submitted:</strong> {formatDate(report.submitted_at)}</p>
                {report.resolved_at && (
                  <p><strong>Resolved:</strong> {formatDate(report.resolved_at)}</p>
                )}
              </div>
            </CardContent>
            {isAdmin && (
              <CardFooter className="flex justify-end space-x-3">
                {report.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleReject}
                      className="text-sm"
                    >
                      Reject
                    </Button>
                    <Button 
                      variant="default" 
                      onClick={handleApprove}
                      className="text-sm"
                    >
                      Approve
                    </Button>
                  </>
                )}
                {report.status === 'approved' && (
                  <Button 
                    variant="destructive" 
                    onClick={handleSolve}
                    className="text-sm"
                  >
                    Mark as Solved
                  </Button>
                )}
              </CardFooter>
            )}
          </div>

          {/* Map Section */}
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Map View</CardTitle>
              <p className="text-muted-foreground">
                Red pin: Report location | Blue pins: Sightings
              </p>
            </CardHeader>
            <CardContent>
              <InteractiveMap
                points={mapPoints}
                center={[report.lat, report.lon]}
                zoom={13}
                onPointClick={(point) => {
                  // Handle sighting click to show description
                  if (point.type === 'sighting') {
                    const sighting = sightings.find((s: any) => String(s.id) === point.id);
                    if (sighting) {
                      alert(`Sighting: ${sighting.description}\nBy: ${sighting.submitted_by}\nAt: ${formatDate(sighting.submitted_at)}`);
                    }
                  }
                }}
                className="h-[400px]"
              />
            </CardContent>
          </div>

          {/* Sightings List */}
          {sightings.length > 0 && (
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Sightings ({sightings.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sightings.map((sighting: any) => (
                  <div key={sighting.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          S
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{sighting.description}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <p><strong>By:</strong> {sighting.submitted_by}</p>
                          <p><strong>At:</strong> {formatDate(sighting.submitted_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              ← Back to Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}