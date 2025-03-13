"use client";

export default function Protected() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Protected Area
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            You have successfully accessed the protected area
          </p>
        </div>
      </div>
    </div>
  );
}
