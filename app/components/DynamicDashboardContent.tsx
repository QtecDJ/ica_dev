"use client";

import { useEffect, useState } from "react";
import { Video, Bell, AlertTriangle, Info, Heart, ExternalLink } from "lucide-react";

interface DashboardContentItem {
  id: number;
  content_type: string;
  title: string;
  content: string;
  priority: number;
  livestream_url: string | null;
  livestream_platform: string | null;
  event_date: string | null;
  background_color: string;
  icon: string | null;
}

export default function DynamicDashboardContent() {
  const [contents, setContents] = useState<DashboardContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const response = await fetch("/api/dashboard-content");
      if (response.ok) {
        const data = await response.json();
        setContents(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard content:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string | null, contentType: string) => {
    const iconClass = "w-6 h-6";
    
    if (iconName) {
      // Custom icon basierend auf iconName
      switch (iconName.toLowerCase()) {
        case "video":
          return <Video className={iconClass} />;
        case "bell":
          return <Bell className={iconClass} />;
        case "alerttriangle":
          return <AlertTriangle className={iconClass} />;
        case "info":
          return <Info className={iconClass} />;
        case "heart":
          return <Heart className={iconClass} />;
        default:
          return <Heart className={iconClass} />;
      }
    }

    // Fallback basierend auf content_type
    switch (contentType) {
      case "livestream":
        return <Video className={iconClass} />;
      case "announcement":
        return <Bell className={iconClass} />;
      case "alert":
        return <AlertTriangle className={iconClass} />;
      case "info":
        return <Info className={iconClass} />;
      default:
        return <Heart className={iconClass} />;
    }
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, { card: string; text: string }> = {
      default: {
        card: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
        text: "text-slate-900 dark:text-slate-50",
      },
      blue: {
        card: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
        text: "text-blue-900 dark:text-blue-100",
      },
      red: {
        card: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
        text: "text-red-900 dark:text-red-100",
      },
      green: {
        card: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        text: "text-green-900 dark:text-green-100",
      },
      yellow: {
        card: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-900 dark:text-yellow-100",
      },
      purple: {
        card: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
        text: "text-purple-900 dark:text-purple-100",
      },
    };
    return colors[color] || colors.default;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Lädt...</p>
        </div>
      </div>
    );
  }

  if (contents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {contents.map((item) => {
        const colorClass = getColorClass(item.background_color);

        return (
          <div key={item.id} className={`card ${colorClass.card}`}>
            <div className="card-body">
              {/* Header mit Icon und Titel */}
              <h3 className={`font-semibold ${colorClass.text} mb-3 flex items-center gap-2`}>
                {getIcon(item.icon, item.content_type)}
                <span>{item.title}</span>
                {item.event_date && (
                  <span className="text-sm font-normal opacity-75 ml-auto">
                    {new Date(item.event_date).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </h3>

              {/* Content */}
              <div
                className={`text-sm ${colorClass.text.replace("900", "800").replace("100", "200")}`}
                dangerouslySetInnerHTML={{ __html: item.content }}
              />

              {/* Livestream Embed */}
              {item.content_type === "livestream" && item.livestream_url && (
                <div className="mt-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={item.livestream_url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {item.livestream_platform?.toUpperCase() || "LIVESTREAM"}
                    </span>
                    <a
                      href={item.livestream_url.replace("/embed/", "/watch?v=")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      In neuem Tab öffnen
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
