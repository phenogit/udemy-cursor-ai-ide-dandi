"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import Notification from "@/components/Notification";

export default function Dashboard() {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(1000);
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch API keys from Supabase
  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data);
    } catch (err) {
      console.error("Error fetching API keys:", err);
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }

  const createApiKey = async () => {
    if (!newKeyName) return;

    try {
      const key = `dandi-${Math.random()
        .toString(36)
        .substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;

      const newKey = {
        name: newKeyName,
        key: key,
        masked_key: `${key.slice(0, 6)}${"*".repeat(25)}`,
        usage: 0,
        rate_limit: limitEnabled ? monthlyLimit : 1000,
      };

      const { data, error } = await supabase
        .from("api_keys")
        .insert([newKey])
        .select()
        .single();

      if (error) throw error;

      setApiKeys([data, ...apiKeys]);
      setNewKeyName("");
      setShowModal(false);
      setMonthlyLimit(1000);
      setLimitEnabled(false);
      showNotification("API Key created successfully");
    } catch (err) {
      console.error("Error creating API key:", err);
      showNotification("Failed to create API key", "error");
    }
  };

  const deleteApiKey = async (id) => {
    try {
      const { error } = await supabase.from("api_keys").delete().eq("id", id);

      if (error) throw error;

      setApiKeys(apiKeys.filter((key) => key.id !== id));
      setVisibleKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      showNotification("API Key deleted successfully");
    } catch (err) {
      console.error("Error deleting API key:", err);
      showNotification("Failed to delete API key", "error");
    }
  };

  const updateKeyName = async (id, newName) => {
    if (!newName.trim()) return;

    try {
      const { error } = await supabase
        .from("api_keys")
        .update({ name: newName.trim() })
        .eq("id", id);

      if (error) throw error;

      setApiKeys(
        apiKeys.map((key) =>
          key.id === id ? { ...key, name: newName.trim() } : key
        )
      );
      setEditingId(null);
      showNotification("API Key name updated successfully");
    } catch (err) {
      console.error("Error updating API key name:", err);
      showNotification("Failed to update API key name", "error");
    }
  };

  const toggleKeyVisibility = (id) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showNotification("API Key copied to clipboard");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      showNotification("Failed to copy API key", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-900">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Overview</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-300 p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium mb-2">CURRENT PLAN</div>
              <h2 className="text-3xl font-bold mb-4">Researcher</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm">API Limit</span>
                <div className="w-full max-w-md bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2"
                    style={{ width: "2.4%" }}
                  ></div>
                </div>
                <span className="text-sm">24/1,000 Requests</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              Manage Plan
            </button>
          </div>
        </div>

        {/* API Keys Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">API Keys</h2>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              + Create New Key
            </button>
          </div>

          {/* API Keys Table */}
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
                          onBlur={(e) =>
                            updateKeyName(apiKey.id, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateKeyName(apiKey.id, e.target.value);
                            } else if (e.key === "Escape") {
                              setEditingId(null);
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
                        {visibleKeys.has(apiKey.id)
                          ? apiKey.key
                          : apiKey.masked_key}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title={
                            visibleKeys.has(apiKey.id)
                              ? "Hide API Key"
                              : "Show API Key"
                          }
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {visibleKeys.has(apiKey.id) ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                          className={`p-2 transition-colors ${
                            copiedId === apiKey.id
                              ? "text-green-500 hover:text-green-700"
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                          title={copiedId === apiKey.id ? "Copied!" : "Copy"}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {copiedId === apiKey.id ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            )}
                          </svg>
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title="Edit name"
                          onClick={() => setEditingId(apiKey.id)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteApiKey(apiKey.id)}
                          className="p-2 text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create API Key Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h2 className="text-xl font-semibold mb-4">
                Create a new API key
              </h2>
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
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
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
                      onChange={(e) => setLimitEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Limit monthly usage*</span>
                  </label>
                  {limitEnabled && (
                    <input
                      type="number"
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                      className="mt-2 w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    *If the combined usage of all your keys exceeds your
                    plan&apos;s limit, all requests will be rejected.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNewKeyName("");
                    setMonthlyLimit(1000);
                    setLimitEnabled(false);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createApiKey}
                  disabled={!newKeyName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="flex justify-between items-center pt-8 border-t dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            Have any questions, feedback or need support? We&apos;d love to hear
            from you!
          </p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
            Contact us
          </button>
        </div>
      </div>
    </div>
  );
}
