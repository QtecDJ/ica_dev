"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TeamMember {
  member_id: string;
  first_name: string;
  last_name: string;
  team_name: string;
  status: "accepted" | "declined" | "pending";
  decline_reason?: string;
}

interface ClickableMiniStatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: "red" | "black" | "white" | "gray";
  status: "accepted" | "declined";
  coachTeamIds: string[];
}

export default function ClickableMiniStatCard({
  icon,
  title,
  value,
  color,
  status,
  coachTeamIds,
}: ClickableMiniStatCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const colorClasses = {
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    black: "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800",
    white: "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900",
    gray: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
  };

  const iconBgClasses = {
    red: "bg-red-100 dark:bg-red-900/30",
    black: "bg-gray-200 dark:bg-gray-700",
    white: "bg-gray-100 dark:bg-gray-800",
    gray: "bg-gray-200 dark:bg-gray-700",
  };

  const handleClick = async () => {
    setIsOpen(true);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/coach/team-attendance-all?status=${status}&teamIds=${coachTeamIds.join(",")}`
      );
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setMembers([]);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="card-hover group text-left w-full cursor-pointer"
      >
        <div className="card-body">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgClasses[color]} ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}
            >
              {icon}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
              {title}
            </p>
          </div>
          <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgClasses[color]} ${colorClasses[color]}`}>
                  {icon}
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {title}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600 dark:text-slate-400">Lädt...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">
                    Keine {status === "accepted" ? "Zusagen" : "Absagen"} vorhanden
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.member_id}
                      className={`p-4 rounded-lg border-2 ${
                        status === "accepted"
                          ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {member.first_name[0]}
                          {member.last_name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-slate-900 dark:text-slate-50">
                              {member.first_name} {member.last_name}
                            </p>
                            {member.team_name && (
                              <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                                {member.team_name}
                              </span>
                            )}
                          </div>
                          {member.decline_reason && (
                            <p className="mt-1 text-sm text-red-800 dark:text-red-300 italic">
                              "{member.decline_reason}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
