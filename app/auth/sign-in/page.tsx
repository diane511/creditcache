import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignInForm } from "./sign-in-form";

type SignInPageProps = { rs
  searchParams?: {
    next?: string;
  };
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(searchParams?.next ?? "/dashboard");
  }

  return <SignInForm nextPath={searchParams?.next ?? "/dashboard"} />;
}