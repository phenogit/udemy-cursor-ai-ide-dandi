export const apiKeyService = {
  async fetchKeys() {
    const response = await fetch("/api/api-keys");
    if (!response.ok) {
      throw new Error("Failed to fetch API keys");
    }
    return response.json();
  },

  async createKey({ name, key, maskedKey, usage = 0, rateLimit = 5 }) {
    const response = await fetch("/api/api-keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        key,
        maskedKey,
        usage,
        rateLimit,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create API key");
    }
    return response.json();
  },

  async updateKeyName(id, name) {
    const response = await fetch(`/api/api-keys/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error("Failed to update API key name");
    }
  },

  async deleteKey(id) {
    const response = await fetch(`/api/api-keys/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete API key");
    }
  },

  generateKey() {
    return `dandi-${Math.random().toString(36).substring(2, 11)}-${Math.random()
      .toString(36)
      .substring(2, 11)}`;
  },

  maskKey(key) {
    return `${key.slice(0, 6)}${"*".repeat(25)}`;
  },
};
