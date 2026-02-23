// app/(auth)/login/page.tsx
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};

  const nextRaw = typeof sp.next === "string" ? sp.next : "/boot";
  const next = nextRaw.startsWith("/login") ? "/boot" : nextRaw;

  return <LoginClient next={next} />;
}