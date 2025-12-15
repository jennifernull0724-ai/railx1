
import AdminUserEditClient from './AdminUserEditClient';

export const dynamic = 'force-dynamic';

export default function AdminUserPage({
  params,
}: {
  params: { id: string };
}) {
  return <AdminUserEditClient userId={params.id} />;
}
