"use client";

import SignInButton from "./SignInButton";
import SignOutButton from "./SignOutButton";
import Image from "next/image";
import DashboardLink from "./DashboardLink";

export default function AuthButtons({ session }) {
  if (session) {
    return (
      <>
        <div className="flex items-center gap-4">
          <DashboardLink className="rounded-full bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 transition-colors" />
          <div className="flex items-center gap-4">
            <Image
              src={session.user.image}
              alt={`${session.user.name}'s profile`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <p className="text-lg">Welcome, {session.user.name}!</p>
          </div>
          <SignOutButton />
        </div>
      </>
    );
  }

  return <SignInButton />;
}
