"use client";

import { useState } from "react";
import { createComment, type Comment } from "../actions";
import { MessageSquare, Lock, Globe, Send } from "lucide-react";

type CommentsSectionProps = {
  comments: Comment[];
  authorId: string;
  memberId?: number;
  trainingId?: number;
  canComment: boolean;
};

export default function CommentsSection({
  comments,
  authorId,
  memberId,
  trainingId,
  canComment,
}: CommentsSectionProps) {
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    const result = await createComment(
      authorId,
      content,
      memberId,
      trainingId,
      isPrivate
    );

    if (result.success) {
      setContent("");
      setIsPrivate(false);
    }
    setIsLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Kommentare</h3>
        <span className="text-sm text-gray-500">({comments.length})</span>
      </div>

      {/* Comment Form */}
      {canComment && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Schreibe einen Kommentar..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
            rows={3}
            required
          />
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
              />
              <div className="flex items-center gap-1 text-sm text-gray-700">
                {isPrivate ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Privat (nur für Coaches/Admins)
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Öffentlich
                  </>
                )}
              </div>
            </label>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Senden
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Noch keine Kommentare</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg ${
                comment.is_private
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {comment.author_name}
                  </span>
                  {comment.is_private && (
                    <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" />
                      Privat
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
