// main/app/auth/signup/page.tsx
import { SignInForm } from "@/components/sign-in-form";

type SignUpPageProps = {
  searchParams?: Promise<{
    next?: string;
    invite?: string;
    inviteToken?: string;
    signupLinkToken?: string;
  }>;
};

export default async function SignUpPage({
  searchParams,
}: SignUpPageProps) {
  const params = searchParams ? await searchParams : undefined;

  const inviteToken =
    params?.invite?.trim() ||
    params?.inviteToken?.trim() ||
    params?.signupLinkToken?.trim() ||
    "";

  return (
    <SignInForm
      nextPath={params?.next ?? "/dashboard"}
      defaultMode="signup"
      inviteToken={inviteToken || undefined}
    />
  );
}