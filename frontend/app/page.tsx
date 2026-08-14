import { redirect } from "next/navigation";

// Root "/" redirects to login. Once logged in, login redirects to /dashboard.
export default function RootPage() {
  redirect("/login");
}
