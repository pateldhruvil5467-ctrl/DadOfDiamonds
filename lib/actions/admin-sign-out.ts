"use server";

import { signOut } from "@/lib/auth";

export async function adminSignOutAction() {
  await signOut({ redirectTo: "/login" });
}
