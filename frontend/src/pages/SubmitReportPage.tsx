import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RippleButton } from '@/components/ui/ripple-button';
import { Toast } from '@/components/ui/toast';
import { InteractiveMap } from '@/components/ui/interactive-map';
import { AlertTriangle, MapPin, User, Phone, Mail, Camera, Clock, Calendar } from 'lucide-react';

interface FormData {
  childName: string;
  age: string;
  gender: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  lastSeenTime: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  photoUrl: string;
  latitude: number | null;
  longitude: number | null;
}

export function SubmitReportPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const [formData, setFormData] = useState<FormData>({
    childName: '',
    age: '',
    gender: '',
    lastSeenLocation: '',
    lastSeenDate: '',
    lastSeenTime: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    photoUrl: '',
    latitude: null,
    longitude: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      setToast({ show: true, message: 'Please select location on the map', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit report');

      setToast({ show: true, message: 'Report submitted successfully! Awaiting admin approval.', type: 'success' });

      setTimeout(() => {
        navigate('/alerts');
      }, 2000);
    } catch (error) {
      setToast({ show: true, message: 'Failed to submit report. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            Report Missing Child
          </h1>
          <p className="text-muted-foreground mt-2">
            Please provide as much detail as possible to help locate the child
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Child Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Child Information
                </CardTitle>
                <CardDescription>Details about the missing child</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Child's Name *</label>
                  <input
                    type="text"
                    name="childName"
                    value={formData.childName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Enter child's name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="0"
                      max="18"
                      className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Physical description, clothing, distinguishing features..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Photo URL (optional)
                  </label>
                  <input
                    type="url"
                    name="photoUrl"
                    value={formData.photoUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Last Seen Details
                </CardTitle>
                <CardDescription>When and where was the child last seen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Last Seen Location *</label>
                  <input
                    type="text"
                    name="lastSeenLocation"
                    value={formData.lastSeenLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Address or landmark"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date *
                    </label>
                    <input
                      type="date"
                      name="lastSeenDate"
                      value={formData.lastSeenDate}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Time *
                    </label>
                    <input
                      type="time"
                      name="lastSeenTime"
                      value={formData.lastSeenTime}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Click on map to mark location *
                  </label>
                  <div className="h-48 rounded-lg overflow-hidden border">
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
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>How can authorities reach you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Name *</label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-center">
            <RippleButton
              type="submit"
              variant="default"
              disabled={loading}
              className="px-8 py-3 text-lg bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </RippleButton>
          </div>
        </form>

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
