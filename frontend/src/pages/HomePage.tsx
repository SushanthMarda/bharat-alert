import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RippleButton } from '@/components/ui/ripple-button';
import { Features } from '@/components/blocks/features';
import { cn } from '@/lib/utils';
import { AlertTriangle, MapPin, Shield, Users, ArrowRight } from 'lucide-react';

export function HomePage() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [stats, setStats] = useState({ activeCount: 0, solvedCount: 0, sightingsCount: 0 });

  const startTransition = useCallback(() => {
    if (!isTransitioning && showWelcome) {
      setIsTransitioning(true);
      // After fade-out completes, hide welcome screen
      setTimeout(() => {
        setShowWelcome(false);
      }, 600);
    }
  }, [isTransitioning, showWelcome]);

  useEffect(() => {
    // Fetch stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    // Listen for wheel event to trigger transition
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && showWelcome) {
        startTransition();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });

    // Also handle touch swipe up
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      if (deltaY > 50 && showWelcome) {
        startTransition();
      }
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [showWelcome, startTransition]);

  return (
    <>
      {/* Welcome Screen Overlay */}
      {showWelcome && (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-background flex items-center justify-center transition-all duration-500 ease-out",
            isTransitioning ? "opacity-0 scale-105" : "opacity-100 scale-100"
          )}
        >
          <div className="relative min-h-screen bg-gradient-to-b from-gray-100 to-white" />
          <div className={cn(
            "relative z-10 text-center transition-all duration-500 ease-out",
            isTransitioning ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0"
          )}>
            <div
              className={cn(
                'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
                'bg-[radial-gradient(ellipse_at_center,theme(colors.red.500/.2),transparent_50%)]',
                'blur-[30px]',
              )}
            />
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500 animate-pulse">
              Bharat Alert
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Child Abduction Alert System
            </p>
            <p className="text-sm text-muted-foreground animate-bounce">
              Scroll down to continue
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "min-h-screen transition-opacity duration-500",
        showWelcome && !isTransitioning ? "opacity-0" : "opacity-100"
      )}>
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="relative min-h-screen bg-gradient-to-b from-gray-100 to-white" />
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500">
            Bharat Alert
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            India's community-powered child abduction alert system. Report, track, and help bring missing children home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/submit-report">
              <RippleButton variant="default" className="text-lg px-8 py-3 bg-red-600 hover:bg-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Report Missing Child
              </RippleButton>
            </Link>
            <Link to="/alerts">
              <RippleButton variant="hoverborder" hoverBorderEffectColor="#3b82f6" className="text-lg px-8 py-3 border border-border bg-card/80 backdrop-blur-sm shadow-sm">
                <MapPin className="w-5 h-5 mr-2" />
                View Active Alerts
              </RippleButton>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            <StatCard label="Active Alerts" value={stats.activeCount} color="text-red-500" />
            <StatCard label="Cases Solved" value={stats.solvedCount} color="text-green-500" />
            <StatCard label="Sightings Reported" value={stats.sightingsCount} color="text-amber-500" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              step={1}
              icon={<AlertTriangle className="w-8 h-8" />}
              title="Report"
              description="Submit details about the missing child with last known location"
            />
            <StepCard
              step={2}
              icon={<Shield className="w-8 h-8" />}
              title="Verify"
              description="Admin team verifies and approves genuine reports"
            />
            <StepCard
              step={3}
              icon={<MapPin className="w-8 h-8" />}
              title="Alert"
              description="Alert is broadcast to the community with map location"
            />
            <StepCard
              step={4}
              icon={<Users className="w-8 h-8" />}
              title="Community"
              description="Citizens can report sightings to help locate the child"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Every Second Counts</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Help us create a safer India for our children. Report any suspicious activity or missing child immediately.
        </p>
        <Link to="/submit-report">
          <RippleButton variant="hover" hoverRippleColor="#dc2626" className="text-lg px-8 py-3">
            Report Now <ArrowRight className="w-5 h-5 ml-2 inline" />
          </RippleButton>
        </Link>
      </section>
      </div>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-card border rounded-lg p-4 text-center">
      <p className={cn("text-3xl font-bold", color)}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="relative inline-block mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
          {step}
        </span>
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
