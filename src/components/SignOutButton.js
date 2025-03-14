"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-full bg-red-600 text-white px-6 py-2 hover:bg-red-700 transition-colors"
    >
      Sign Out
    </button>
  );
}
