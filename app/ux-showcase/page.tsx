"use client";

import { useState } from "react";
import {
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Lock,
  Search,
  Calendar,
  Users,
  Settings,
  Bell,
  Home,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  Minus,
  Star,
  Heart
} from "lucide-react";

export default function UXShowcase() {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("buttons");

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-slate-50 dark:from-slate-900 dark:via-red-900/10 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="container-page">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                UX Showcase 2025
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Komplettes Design System - Teste alle Komponenten lokal
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-red">Beta</span>
              <span className="badge-blue">Modern</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container-page mt-6">
        <div className="card">
          <div className="card-body p-2">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: "buttons", label: "Buttons", icon: Plus },
                { id: "cards", label: "Cards", icon: Home },
                { id: "forms", label: "Forms", icon: Edit },
                { id: "badges", label: "Badges", icon: Star },
                { id: "alerts", label: "Alerts", icon: AlertCircle },
                { id: "loading", label: "Loading", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-250 ${
                    selectedTab === tab.id
                      ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md"
                      : "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-page mt-6 pb-12">
        {selectedTab === "buttons" && <ButtonsShowcase onLoadingTest={simulateLoading} loading={loading} />}
        {selectedTab === "cards" && <CardsShowcase />}
        {selectedTab === "forms" && <FormsShowcase />}
        {selectedTab === "badges" && <BadgesShowcase />}
        {selectedTab === "alerts" && <AlertsShowcase />}
        {selectedTab === "loading" && <LoadingShowcase />}
      </div>
    </div>
  );
}

/* ===== BUTTONS SHOWCASE ===== */
function ButtonsShowcase({ onLoadingTest, loading }: { onLoadingTest: () => void; loading: boolean }) {
  return (
    <div className="space-y-8">
      <div className="card animate-slide-in-up">
        <div className="card-header">
          <h2 className="text-2xl font-bold">Primary Buttons</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Hauptaktionen mit Gradient und Hover-Effekt
          </p>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary" onClick={onLoadingTest} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-sm" />
                  Loading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Primary Button
                </>
              )}
            </button>
            <button className="btn-primary btn-lg">
              <Download className="w-5 h-5" />
              Large Button
            </button>
            <button className="btn-primary btn-sm">
              <Check className="w-3 h-3" />
              Small Button
            </button>
            <button className="btn-primary" disabled>
              <X className="w-4 h-4" />
              Disabled
            </button>
          </div>
        </div>
      </div>

      <div className="card animate-slide-in-up" style={{ animationDelay: '50ms' }}>
        <div className="card-header">
          <h2 className="text-2xl font-bold">Secondary & Ghost Buttons</h2>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <button className="btn-secondary">
              <Settings className="w-4 h-4" />
              Secondary
            </button>
            <button className="btn-ghost">
              <User className="w-4 h-4" />
              Ghost Button
            </button>
            <button className="btn-danger">
              <Trash2 className="w-4 h-4" />
              Danger
            </button>
            <button className="btn-success">
              <CheckCircle className="w-4 h-4" />
              Success
            </button>
          </div>
        </div>
      </div>

      <div className="card animate-slide-in-up" style={{ animationDelay: '100ms' }}>
        <div className="card-header">
          <h2 className="text-2xl font-bold">Icon Buttons</h2>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <button className="btn-icon">
              <Heart className="w-5 h-5" />
            </button>
            <button className="btn-icon">
              <Star className="w-5 h-5" />
            </button>
            <button className="btn-icon">
              <Bell className="w-5 h-5" />
            </button>
            <button className="btn-icon">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== CARDS SHOWCASE ===== */
function CardsShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card-hover animate-slide-in-up">
        <div className="card-header">
          <h3 className="text-xl font-bold">Hover Card</h3>
        </div>
        <div className="card-body">
          <p className="text-slate-600 dark:text-slate-400">
            Hover über diese Card für einen eleganten Effekt!
          </p>
        </div>
      </div>

      <div className="card-glass animate-slide-in-up" style={{ animationDelay: '50ms' }}>
        <div className="card-body">
          <h3 className="text-xl font-bold mb-2">Glass Card</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Glassmorphismus-Effekt mit Backdrop-Blur
          </p>
        </div>
      </div>

      <div className="card-gradient animate-slide-in-up" style={{ animationDelay: '100ms' }}>
        <div className="card-body">
          <h3 className="text-xl font-bold mb-2">Gradient Card</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Subtiler Gradient-Hintergrund
          </p>
        </div>
      </div>

      <div className="card animate-slide-in-up" style={{ animationDelay: '150ms' }}>
        <div className="card-header">
          <Users className="w-5 h-5 text-red-600" />
          <h3 className="text-xl font-bold ml-2">Standard Card</h3>
        </div>
        <div className="card-body">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Mit Header und Footer
          </p>
        </div>
        <div className="card-footer">
          <button className="btn-primary btn-sm">Action</button>
          <button className="btn-ghost btn-sm ml-2">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ===== FORMS SHOWCASE ===== */
function FormsShowcase() {
  return (
    <div className="card animate-slide-in-up">
      <div className="card-header">
        <h2 className="text-2xl font-bold">Form Elements</h2>
      </div>
      <div className="card-body space-y-6">
        <div>
          <label className="label">Normal Input</label>
          <input type="text" className="input" placeholder="Enter your name..." />
        </div>

        <div>
          <label className="label">Input with Icon</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="email" className="input pl-12" placeholder="email@example.com" />
          </div>
        </div>

        <div>
          <label className="label">Error State</label>
          <input type="text" className="input-error" placeholder="Invalid input" />
          <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            This field is required
          </p>
        </div>

        <div>
          <label className="label">Success State</label>
          <input type="text" className="input-success" value="Valid input" readOnly />
          <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Looks good!
          </p>
        </div>

        <div>
          <label className="label">Textarea</label>
          <textarea className="textarea" placeholder="Enter your message..."></textarea>
        </div>

        <div>
          <label className="label">Select</label>
          <select className="select">
            <option>Select an option...</option>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button className="btn-primary">Submit Form</button>
          <button className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ===== BADGES SHOWCASE ===== */
function BadgesShowcase() {
  return (
    <div className="card animate-slide-in-up">
      <div className="card-header">
        <h2 className="text-2xl font-bold">Badges & Tags</h2>
      </div>
      <div className="card-body space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Role Badges</h3>
          <div className="flex flex-wrap gap-3">
            <span className="badge-red">Admin</span>
            <span className="badge-orange">Manager</span>
            <span className="badge-blue">Coach</span>
            <span className="badge-green">Member</span>
            <span className="badge-purple">Parent</span>
            <span className="badge-gray">Guest</span>
          </div>
        </div>

        <div className="divider"></div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Status Badges</h3>
          <div className="flex flex-wrap gap-3">
            <span className="badge-green">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </span>
            <span className="badge-red">
              <XCircle className="w-3 h-3 mr-1" />
              Inactive
            </span>
            <span className="badge-orange">
              <AlertCircle className="w-3 h-3 mr-1" />
              Pending
            </span>
            <span className="badge-blue">
              <Info className="w-3 h-3 mr-1" />
              Info
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== ALERTS SHOWCASE ===== */
function AlertsShowcase() {
  return (
    <div className="space-y-6">
      <div className="alert-info animate-slide-in-up">
        <Info className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold">Information</h4>
          <p className="text-sm mt-1">Dies ist eine informative Nachricht für den Benutzer.</p>
        </div>
      </div>

      <div className="alert-success animate-slide-in-up" style={{ animationDelay: '50ms' }}>
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold">Success</h4>
          <p className="text-sm mt-1">Die Aktion wurde erfolgreich durchgeführt!</p>
        </div>
      </div>

      <div className="alert-warning animate-slide-in-up" style={{ animationDelay: '100ms' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold">Warning</h4>
          <p className="text-sm mt-1">Bitte überprüfe deine Eingaben noch einmal.</p>
        </div>
      </div>

      <div className="alert-error animate-slide-in-up" style={{ animationDelay: '150ms' }}>
        <XCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold">Error</h4>
          <p className="text-sm mt-1">Ein Fehler ist aufgetreten. Bitte versuche es erneut.</p>
        </div>
      </div>
    </div>
  );
}

/* ===== LOADING SHOWCASE ===== */
function LoadingShowcase() {
  return (
    <div className="space-y-6">
      <div className="card animate-slide-in-up">
        <div className="card-header">
          <h2 className="text-2xl font-bold">Spinners</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="spinner-sm"></div>
              <p className="text-sm mt-2">Small</p>
            </div>
            <div className="text-center">
              <div className="spinner"></div>
              <p className="text-sm mt-2">Default</p>
            </div>
            <div className="text-center">
              <div className="spinner-lg"></div>
              <p className="text-sm mt-2">Large</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card animate-slide-in-up" style={{ animationDelay: '50ms' }}>
        <div className="card-header">
          <h2 className="text-2xl font-bold">Skeleton Loading</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="skeleton h-12 w-3/4"></div>
          <div className="skeleton h-8 w-full"></div>
          <div className="skeleton h-8 w-5/6"></div>
          <div className="flex gap-4">
            <div className="skeleton h-20 w-20 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/2"></div>
              <div className="skeleton h-4 w-3/4"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card animate-slide-in-up" style={{ animationDelay: '100ms' }}>
        <div className="card-header">
          <h2 className="text-2xl font-bold">Shimmer Effect</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="skeleton-shimmer h-12 w-3/4"></div>
          <div className="skeleton-shimmer h-8 w-full"></div>
          <div className="skeleton-shimmer h-8 w-5/6"></div>
        </div>
      </div>
    </div>
  );
}
