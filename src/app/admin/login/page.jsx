import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLoginPageClient from './AdminLoginPageClient';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect('/admin/dashboard');
  }

  return <AdminLoginPageClient />;
}
