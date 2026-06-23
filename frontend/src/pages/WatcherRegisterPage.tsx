import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InteractiveMap } from '@/components/ui/interactive-map';
import { useAuth } from '@/contexts/AuthContext';

export function WatcherRegisterPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone_number: '',
    lat: 0,
    lon: 0,
  });
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setFormData(prev => ({
      ...prev,
      lat,
      lon: lng,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.registerWatcher(formData);
      showToast('Watcher registered successfully!', 'success');
      // Redirect to alerts page or home
      navigate('/alerts');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Register as Area Watcher</CardTitle>
              <p className="text-muted-foreground">
                Help protect children in your community by becoming a registered watcher.
                Provide your location to receive alerts about missing children nearby.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Choose a username"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    placeholder="Enter a secure password"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="phone_number" className="block text-sm font-medium mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="phone_number"
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="location" className="block text-sm font-medium mb-2">
                    Your Location
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Click on the map to set your location, or it will be detected automatically.
                  </p>
                  <div className="border rounded-lg">
                    <InteractiveMap
                      selectable
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                      className="h-[400px]"
                    />
                  </div>
                  {selectedLocation && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                variant="default"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Registering...' : 'Register as Watcher'}
              </Button>
            </CardFooter>
          </div>
        </div>
      </div>
    </div>
  );
}