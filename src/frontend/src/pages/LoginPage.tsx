import { Button } from "@/components/ui/button";
import { Globe, GraduationCap, TrendingUp, Users } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-sidebar border-r border-border p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-foreground">
              Origo Abroad
            </div>
            <div className="text-xs text-muted-foreground">
              Marketing Command Center
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="font-display font-bold text-4xl text-foreground leading-tight">
              Your marketing
              <br />
              <span className="text-primary">intelligence</span>
              <br />
              hub.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Track leads, measure ROAS, and orchestrate content — all from one
              command center.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users, label: "Active Leads", value: "Real-time" },
              { icon: TrendingUp, label: "ROAS Tracking", value: "Live Data" },
              { icon: Globe, label: "Global Reach", value: "All Channels" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <Icon className="w-5 h-5 text-primary mb-2" />
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-sm font-semibold text-foreground">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} Origo Abroad. Built with{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/50 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Origo Abroad
            </span>
          </div>

          <div className="text-center">
            <h3 className="font-display font-bold text-2xl text-foreground">
              Welcome back
            </h3>
            <p className="mt-2 text-muted-foreground">
              Sign in to access the command center
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Authenticate with Internet Identity — a secure, passwordless
                login powered by the Internet Computer.
              </p>
            </div>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="login.primary_button"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                "Sign in with Internet Identity"
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Secure, decentralized authentication — no passwords required.
          </p>
        </div>
      </div>
    </div>
  );
}
