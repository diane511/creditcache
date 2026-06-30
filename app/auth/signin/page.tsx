import { SignInForm } from "@/components/sign-in-form";

type PageProps = {
  searchParams: Promise<{ next?: string; reason?: string }>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const { next, reason } = await searchParams;

  const notice =
    reason === "session-expired"
      ? "Your session timed out. Please sign in again."
      : null;

  return <SignInForm nextPath={next ?? "/dashboard"} notice={notice} />;
}