import { memo } from "react";

const CreateKeyModal = ({
  isOpen,
  onClose,
  onCreate,
  keyName,
  onKeyNameChange,
  limitEnabled,
  onLimitEnabledChange,
  monthlyLimit,
  onMonthlyLimitChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Create a new API key</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Enter a name and limit for the new API key.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key Name
              <span className="text-gray-400 font-normal">
                {" "}
                — A unique name to identify this key
              </span>
            </label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => onKeyNameChange(e.target.value)}
              placeholder="Key Name"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              autoFocus
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={limitEnabled}
                onChange={(e) => onLimitEnabledChange(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span>Limit monthly usage*</span>
            </label>
            {limitEnabled && (
              <input
                type="number"
                value={monthlyLimit}
                onChange={(e) => onMonthlyLimitChange(Number(e.target.value))}
                className="mt-2 w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              *If the combined usage of all your keys exceeds your plan&apos;s
              limit, all requests will be rejected.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!keyName}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(CreateKeyModal);
