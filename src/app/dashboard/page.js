"use client";

import { useState, useEffect, useCallback } from "react";
import { apiKeyService } from "@/services/apiKeyService";
import { useNotification } from "@/hooks/useNotification";
import Notification from "@/components/Notification";
import ApiKeyTable from "@/components/ApiKeyTable";
import CreateKeyModal from "@/components/CreateKeyModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(1000);
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { notification, showNotification } = useNotification();
  const { data: session, status } = useSession();
  const router = useRouter();

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiKeyService.fetchKeys();
      setApiKeys(data);
    } catch (err) {
      console.error("Error fetching API keys:", err);
      showNotification("Failed to load API keys", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchApiKeys();
    }
  }, [status, router, fetchApiKeys]);

  const handleCreateKey = async () => {
    if (!newKeyName) return;

    try {
      const key = apiKeyService.generateKey();
      const maskedKey = apiKeyService.maskKey(key);

      const data = await apiKeyService.createKey({
        name: newKeyName,
        key,
        maskedKey,
        rateLimit: limitEnabled ? monthlyLimit : null,
      });

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

  const handleDeleteKey = async (id) => {
    try {
      await apiKeyService.deleteKey(id);
      setApiKeys(apiKeys.filter((key) => key.id !== id));
      setVisibleKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      showNotification("API Key deleted successfully");
    } catch (err) {
      console.error(`Error deleting API key: ${err}`);
      showNotification("Failed to delete API key", "error");
    }
  };

  const handleUpdateKeyName = async (id, newName) => {
    if (!newName.trim()) return;

    try {
      await apiKeyService.updateKeyName(id, newName);
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

  const handleToggleKeyVisibility = useCallback((id) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleCopyToClipboard = useCallback(
    async (text, id) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        showNotification("API Key copied to clipboard");
      } catch (err) {
        console.error("Failed to copy text: ", err);
        showNotification("Failed to copy API key", "error");
      }
    },
    [showNotification]
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-900">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="max-w-6xl mx-auto p-4 pl-16 sm:p-6 sm:pl-16 md:p-8 md:pl-16 space-y-4 sm:space-y-6 md:space-y-8 md:ml-64">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold pl-2">Overview</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Operational
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-400 to-amber-300 p-4 sm:p-6 md:p-8 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <div className="text-sm font-medium mb-2">CURRENT PLAN</div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Researcher
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-sm">API Limit</span>
                <div className="w-full sm:w-64 bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2"
                    style={{ width: "2.4%" }}
                  ></div>
                </div>
                <span className="text-sm">24/1,000 Requests</span>
              </div>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              Manage Plan
            </button>
          </div>
        </div>

        {/* API Keys Section */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">API Keys</h2>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              + Create New Key
            </button>
          </div>

          <div className="overflow-x-auto">
            <ApiKeyTable
              apiKeys={apiKeys}
              visibleKeys={visibleKeys}
              copiedId={copiedId}
              editingId={editingId}
              onToggleVisibility={handleToggleKeyVisibility}
              onCopy={handleCopyToClipboard}
              onEdit={setEditingId}
              onDelete={handleDeleteKey}
              onUpdateName={handleUpdateKeyName}
            />
          </div>
        </div>

        <CreateKeyModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setNewKeyName("");
            setMonthlyLimit(1000);
            setLimitEnabled(false);
          }}
          onCreate={handleCreateKey}
          keyName={newKeyName}
          onKeyNameChange={setNewKeyName}
          limitEnabled={limitEnabled}
          onLimitEnabledChange={setLimitEnabled}
          monthlyLimit={monthlyLimit}
          onMonthlyLimitChange={setMonthlyLimit}
        />

        {/* Contact Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 sm:pt-8 border-t dark:border-gray-700">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Have any questions, feedback or need support? We&apos;d love to hear
            from you!
          </p>
          <button className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
            Contact us
          </button>
        </div>
      </div>
    </div>
  );
}
