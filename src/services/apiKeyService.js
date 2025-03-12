import { supabase } from "@/utils/supabase";

export const apiKeyService = {
  async fetchKeys() {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createKey({ name, key, maskedKey, usage = 0, rateLimit }) {
    const { data, error } = await supabase
      .from("api_keys")
      .insert([
        {
          name,
          key,
          masked_key: maskedKey,
          usage,
          rate_limit: rateLimit,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateKeyName(id, name) {
    const { error } = await supabase
      .from("api_keys")
      .update({ name: name.trim() })
      .eq("id", id);

    if (error) throw error;
  },

  async deleteKey(id) {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);

    if (error) throw error;
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
