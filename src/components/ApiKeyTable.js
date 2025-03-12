import { memo } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  ClipboardIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const ApiKeyTable = ({
  apiKeys,
  visibleKeys,
  copiedId,
  editingId,
  onToggleVisibility,
  onCopy,
  onEdit,
  onDelete,
  onUpdateName,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
              NAME
            </th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
              USAGE
            </th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
              KEY
            </th>
            <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">
              OPTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map((apiKey) => (
            <tr
              key={apiKey.id}
              className="border-b dark:border-gray-700 last:border-0"
            >
              <td className="px-6 py-4">
                {editingId === apiKey.id ? (
                  <input
                    type="text"
                    defaultValue={apiKey.name}
                    onBlur={(e) => onUpdateName(apiKey.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onUpdateName(apiKey.id, e.target.value);
                      } else if (e.key === "Escape") {
                        onEdit(null);
                      }
                    }}
                    className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 w-full"
                    autoFocus
                  />
                ) : (
                  apiKey.name
                )}
              </td>
              <td className="px-6 py-4">{apiKey.usage}</td>
              <td className="px-6 py-4 font-mono text-sm">
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {visibleKeys.has(apiKey.id) ? apiKey.key : apiKey.masked_key}
                </code>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onToggleVisibility(apiKey.id)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title={
                      visibleKeys.has(apiKey.id)
                        ? "Hide API Key"
                        : "Show API Key"
                    }
                  >
                    {visibleKeys.has(apiKey.id) ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onCopy(apiKey.key, apiKey.id)}
                    className={`p-2 transition-colors ${
                      copiedId === apiKey.id
                        ? "text-green-500 hover:text-green-700"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    title={copiedId === apiKey.id ? "Copied!" : "Copy"}
                  >
                    {copiedId === apiKey.id ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <ClipboardIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title="Edit name"
                    onClick={() => onEdit(apiKey.id)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(apiKey.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(ApiKeyTable);
