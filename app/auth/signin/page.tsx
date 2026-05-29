// main/app/auth/sign-in/page.tsx
import { SignInForm } from "@/components/sign-in-form";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return <SignInForm nextPath={next ?? "/dashboard"} />;
}