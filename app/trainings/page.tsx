import { getTrainings, deleteTraining } from "../actions";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";

export default async function TrainingsPage() {
  const trainings = await getTrainings();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Trainings</h1>
        <Link
          href="/trainings/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neues Training
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zeit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ort
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trainings.map((training: any) => (
              <tr key={training.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {training.team_name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(training.training_date).toLocaleDateString("de-DE")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {training.start_time} - {training.end_time}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {training.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/trainings/${training.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={training.id} action={deleteTraining} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {trainings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Noch keine Trainings vorhanden. Erstelle dein erstes Training!
          </div>
        )}
      </div>
    </div>
  );
}
