"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Notification from "@/components/Notification";
import Sidebar from "@/components/Sidebar";

export default function Playground() {
  const [apiKey, setApiKey] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [notification, setNotification] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSummary(null);

    try {
      // First validate the API key
      const validateResponse = await fetch("/api/validate-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!validateResponse.ok) {
        setNotification({
          message: "Invalid API key",
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      // If GitHub URL is provided, make request to summarizer
      if (githubUrl) {
        const summaryResponse = await fetch("/api/github-summarizer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ githubUrl }),
        });

        const data = await summaryResponse.json();

        if (summaryResponse.ok) {
          setSummary(data);
          setNotification({
            message: "Repository summary generated successfully",
            type: "success",
          });
        } else {
          setNotification({
            message: data.error || "Error generating summary",
            type: "error",
          });
        }
      } else {
        setNotification({
          message: "Valid API key",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setNotification({
        message: "An error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        <div className="max-w-2xl w-full mx-auto space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              API Playground
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Test your API key and try the GitHub repository summarizer
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label
                  htmlFor="api-key"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  API Key
                </label>
                <input
                  id="api-key"
                  name="api-key"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="github-url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  GitHub Repository URL (optional)
                </label>
                <input
                  id="github-url"
                  name="github-url"
                  type="url"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="https://github.com/owner/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Submit"}
              </button>
            </div>
          </form>

          {/* Summary Results */}
          {summary && (
            <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Repository Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    Stars:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {summary.stars}
                  </span>
                </div>
                {summary.latestVersion && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      Latest Version:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {summary.latestVersion}
                    </span>
                  </div>
                )}
                {summary.license?.name && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      License:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {summary.license.name}
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Summary
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {summary.summary.summary}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Cool Facts
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {summary.summary.cool_facts.map((fact, index) => (
                      <li
                        key={index}
                        className="text-gray-600 dark:text-gray-300"
                      >
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
