// app/page.tsx
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};

  // your old logic: next = sp.get("next") || "/boot"
  const nextRaw = typeof sp.next === "string" ? sp.next : "/boot";

  // prevent loops: next=/login should not happen
  const next = nextRaw.startsWith("/login") ? "/boot" : nextRaw;

  return <HomeClient next={next} />;
}