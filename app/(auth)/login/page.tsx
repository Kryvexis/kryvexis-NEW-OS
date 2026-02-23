// app/(auth)/login/page.tsx
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const nextRaw =
    typeof searchParams?.next === "string" ? searchParams.next : "/boot";

  // Prevent redirect loops by never allowing next=/login (or empty)
  const next = nextRaw.startsWith("/login") ? "/boot" : nextRaw;

  return <LoginClient next={next} />;
}