import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { AlertTriangle, MapPin, Shield, Bell, CheckCircle, LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

export function Features() {
  return (
    <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-5xl">
        <div className="mx-auto grid gap-4 lg:grid-cols-2">
          <FeatureCard>
            <CardHeader className="pb-3">
              <CardHeading
                icon={MapPin}
                title="Real-time Location Tracking"
                description="Track missing children with precise GPS coordinates and live map updates."
              />
            </CardHeader>

            <div className="relative mb-6 border-t border-dashed sm:mb-0">
              <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,hsl(var(--muted)),white_125%)]"></div>
              <div className="aspect-[76/59] p-1 px-6 flex items-center justify-center">
                <LocationTrackingIllustration />
              </div>
            </div>
          </FeatureCard>

          <FeatureCard>
            <CardHeader className="pb-3">
              <CardHeading
                icon={AlertTriangle}
                title="Instant Alert System"
                description="Broadcast alerts to nearby communities within seconds of report submission."
              />
            </CardHeader>

            <CardContent>
              <div className="relative mb-6 sm:mb-0">
                <div className="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,hsl(var(--background))_100%)]"></div>
                <div className="aspect-[76/59] border rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/20 dark:to-rose-900/20">
                  <AlertSystemIllustration />
                </div>
              </div>
            </CardContent>
          </FeatureCard>

          <FeatureCard className="p-6 lg:col-span-2">
            <p className="mx-auto my-6 max-w-md text-balance text-center text-2xl font-semibold">
              Community-powered child safety network across India
            </p>

            <div className="flex justify-center gap-8 overflow-hidden">
              <ProcessStep
                icon={AlertTriangle}
                label="Report"
                color="text-red-500"
                bgColor="bg-red-100 dark:bg-red-900/30"
              />

              <ProcessStep
                icon={Shield}
                label="Verify"
                color="text-blue-500"
                bgColor="bg-blue-100 dark:bg-blue-900/30"
              />

              <ProcessStep
                icon={Bell}
                label="Alert"
                color="text-rose-500"
                bgColor="bg-rose-100 dark:bg-rose-900/30"
              />

              <ProcessStep
                icon={CheckCircle}
                label="Resolve"
                color="text-green-500"
                bgColor="bg-green-100 dark:bg-green-900/30"
                className="hidden sm:flex"
              />
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  children: ReactNode
  className?: string
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
  <Card className={cn('group relative rounded-none shadow-zinc-950/5', className)}>
    <CardDecorator />
    {children}
  </Card>
)

const CardDecorator = () => (
  <>
    <span className="border-primary absolute -left-px -top-px block size-2 border-l-2 border-t-2"></span>
    <span className="border-primary absolute -right-px -top-px block size-2 border-r-2 border-t-2"></span>
    <span className="border-primary absolute -bottom-px -left-px block size-2 border-b-2 border-l-2"></span>
    <span className="border-primary absolute -bottom-px -right-px block size-2 border-b-2 border-r-2"></span>
  </>
)

interface CardHeadingProps {
  icon: LucideIcon
  title: string
  description: string
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
  <div className="p-6">
    <span className="text-muted-foreground flex items-center gap-2">
      <Icon className="size-4" />
      {title}
    </span>
    <p className="mt-8 text-2xl font-semibold">{description}</p>
  </div>
)

interface ProcessStepProps {
  icon: LucideIcon
  label: string
  color: string
  bgColor: string
  className?: string
}

const ProcessStep = ({ icon: Icon, label, color, bgColor, className }: ProcessStepProps) => (
  <div className={cn("flex flex-col items-center gap-2", className)}>
    <div className={cn("p-4 rounded-xl", bgColor)}>
      <Icon className={cn("w-8 h-8", color)} />
    </div>
    <span className="text-sm text-muted-foreground font-medium">{label}</span>
  </div>
)

const LocationTrackingIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center p-8">
    <div className="relative w-48 h-48">
      {/* Map background */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-100 to-sky-200 dark:from-blue-900/40 dark:to-sky-800/40 border border-blue-200 dark:border-blue-800">
        {/* Grid lines */}
        <div className="absolute inset-2 opacity-30">
          {[...Array(4)].map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-blue-400" style={{ top: `${(i + 1) * 20}%` }} />
          ))}
          {[...Array(4)].map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-blue-400" style={{ left: `${(i + 1) * 20}%` }} />
          ))}
        </div>
      </div>
      {/* Location markers */}
      <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-500 rounded-full shadow-lg animate-pulse" />
      <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-rose-400 rounded-full shadow-md" />
      <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-rose-400 rounded-full shadow-md" />
      {/* Ripple effect */}
      <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75" />
      {/* Center pin */}
      <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-red-600 drop-shadow-lg" />
    </div>
  </div>
)

const AlertSystemIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center p-8">
    <div className="relative">
      {/* Central alert */}
      <div className="relative z-10 bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-xl border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-sm">Alert Broadcast</p>
            <p className="text-xs text-muted-foreground">Sending to 1,234 users</p>
          </div>
        </div>
      </div>
      {/* Broadcast waves */}
      <div className="absolute inset-0 -m-8 border-2 border-red-200 dark:border-red-800 rounded-full animate-ping opacity-20" />
      <div className="absolute inset-0 -m-16 border-2 border-red-200 dark:border-red-800 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
      {/* Small notification dots */}
      <div className="absolute -top-4 -right-4 w-3 h-3 bg-green-500 rounded-full shadow" />
      <div className="absolute -bottom-2 -left-6 w-3 h-3 bg-green-500 rounded-full shadow" />
      <div className="absolute top-1/2 -right-8 w-3 h-3 bg-green-500 rounded-full shadow" />
    </div>
  </div>
)
