import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }
  
  if (user.role === 'USER') {
    redirect('/')
  }
  
  if (user.role === 'ADMIN') {
    redirect('/dashboard/admin')
  }
  
  if (user.role === 'SELLER') {
    redirect('/dashboard/seller')
  }
}