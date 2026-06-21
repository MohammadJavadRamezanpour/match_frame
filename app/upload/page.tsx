import { AppHeader } from '@/components/header';
import { requireUser } from '@/lib/auth';
import { UploadFlow } from '@/components/upload-flow';

export const dynamic = 'force-dynamic';

export default async function UploadPage() {
  const { user } = await requireUser();
  return (
    <>
      <AppHeader email={user.email} />
      <UploadFlow userId={user.id} />
    </>
  );
}
