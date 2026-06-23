'use client';
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const location = useLocation();

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Alerts', href: '/alerts' },
    { label: 'Report', href: '/submit-report' },
    { label: 'Admin', href: '/admin' },
    { label: 'Register Watcher', href: '/watcher-register' },
  ];

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out',
        {
          'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-4xl md:shadow':
            scrolled && !open,
          'bg-background/90': open,
        },
      )}
    >
      <nav
        className={cn(
          'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
          {
            'md:px-2': scrolled,
          },
        )}
      >
        <Link to="/" className="flex items-center gap-2">
          <BharatAlertLogo className="h-8" />
          <span className="font-bold text-lg hidden sm:block">Bharat Alert</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                location.pathname === link.href && 'bg-accent'
              )}
              to={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      <div
        className={cn(
          'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
          open ? 'block' : 'hidden',
        )}
      >
        <div
          data-slot={open ? 'open' : 'closed'}
          className={cn(
            'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
            'flex h-full w-full flex-col justify-between gap-y-2 p-4',
          )}
        >
          <div className="grid gap-y-2">
            {links.map((link) => (
              <Link
                key={link.label}
                className={cn(
                  buttonVariants({ variant: 'ghost', className: 'justify-start' }),
                  location.pathname === link.href && 'bg-accent'
                )}
                to={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export const BharatAlertLogo = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 100 100" fill="none" {...props}>
    {/* Shield shape */}
    <path
      d="M50 5 L90 20 L90 50 C90 75 70 90 50 95 C30 90 10 75 10 50 L10 20 Z"
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="3"
    />
    {/* Inner alert triangle */}
    <path
      d="M50 30 L70 65 L30 65 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    {/* Exclamation mark */}
    <line x1="50" y1="42" x2="50" y2="52" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="50" cy="58" r="2.5" fill="currentColor"/>
    {/* Child figure in center bottom */}
    <circle cx="50" cy="75" r="4" fill="currentColor"/>
    <path d="M50 79 L50 85 M45 82 L55 82" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
