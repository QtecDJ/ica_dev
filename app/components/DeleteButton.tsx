"use client";
import { Trash2 } from "lucide-react";

export default function DeleteButton({ id, action }: { id: number; action: (id: number) => Promise<any> }) {
  const handleDelete = async () => {
    if (confirm("Bist du sicher, dass du dieses Element löschen möchtest?")) {
      await action(id);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-900"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
