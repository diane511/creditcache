import { SignInForm } from "@/components/sign-in-form";

export default function SignUpPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  return (
    <SignInForm
      nextPath={searchParams?.next ?? "/dashboard"}
      defaultMode="signup"
    />
  );
}