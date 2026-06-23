import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RippleButton } from '@/components/ui/ripple-button';
import { useToast } from '@/components/ui/toast';
import { InteractiveMap } from '@/components/ui/interactive-map';
import { Eye, MapPin, MessageSquare, Phone, ArrowLeft } from 'lucide-react';

interface SightingForm {
  location: string;
  latitude: number | null;
  longitude: number | null;
  comment: string;
  contactInfo: string;
}

export function SightingPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<SightingForm>({
    location: '',
    latitude: null,
    longitude: null,
    comment: '',
    contactInfo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const { token } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      showToast('Please select the sighting location on the map', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.createSighting({
        ...formData,
        reportId,
        token,
      });
      showToast('Sighting reported successfully! Thank you for helping.', 'success');
      navigate('/alerts');
    } catch (error: any) {
      showToast(error.message || 'Failed to submit sighting. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/alerts" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Alerts
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Eye className="w-8 h-8 text-blue-500" />
            Report a Sighting
          </h1>
          <p className="text-muted-foreground mt-2">
            If you've seen this child, please provide details to help locate them
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Sighting Details</CardTitle>
              <CardDescription>
                Provide as much information as possible about where and when you saw the child
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location Description *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g., Near Central Park, Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Click on map to mark sighting location *
                </label>
                <div className="h-64 rounded-lg overflow-hidden border">
                  <InteractiveMap
                    selectable
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={
                      formData.latitude && formData.longitude
                        ? { lat: formData.latitude, lng: formData.longitude }
                        : null
                    }
                    zoom={5}
                  />
                </div>
                {formData.latitude && formData.longitude && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Additional Details *
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder="Describe what you saw - who was the child with, what were they wearing, direction they were heading, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Your Contact Info (optional)
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Phone number or email (optional, for follow-up)"
                />
              </div>

              <div className="pt-4">
                <RippleButton
                  type="submit"
                  variant="default"
                  disabled={loading}
                  className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Submitting...' : 'Submit Sighting Report'}
                </RippleButton>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Toasts are handled globally via useToast, no inline Toast needed */}
      </div>
    </div>
  );
}
