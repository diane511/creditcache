import { redirect } from "next/navigation";

type Props = {
  searchParams?: {
    next?: string;
  };
};

export default function CreditCachePage({ searchParams }: Props) {
  const nextPath = searchParams?.next ?? "/dashboard";
  redirect(`/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
}