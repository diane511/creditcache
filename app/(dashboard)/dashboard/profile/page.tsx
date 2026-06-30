import { ProfileSection } from "./ProfileSection";
import { getCurrentUser } from "@/lib/auth";
import { getProfileSectionData } from "@/lib/profile";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfileSectionData(user.id) : null;

  return <ProfileSection profile={profile} isAuthenticated={!!user} />;
}