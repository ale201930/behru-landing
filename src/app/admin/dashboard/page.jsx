import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getLandingContent } from '@/lib/content';
import AdminDashboardClient from './AdminDashboardClient';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/admin/login');
  }

  const { config, media } = await getLandingContent();

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f8fafc', minHeight: '100vh' }}>
      <AdminDashboardClient initialConfig={config} initialMedia={media} user={session} />
    </div>
  );
}
