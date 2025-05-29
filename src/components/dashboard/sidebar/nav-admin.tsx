'use client' // Make sure this is a client component

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  FolderTree, 
  Tag, 
  Package, 
  Users, 
  Settings, 
  BarChart3,
  LucideIcon 
} from 'lucide-react'

// Icon mapping object
const iconMap: Record<string, LucideIcon> = {
  Home,
  FolderTree,
  Tag,
  Package, // Add Package icon here
  Users,
  Settings,
  BarChart3,
}

interface MenuLink {
  id: string
  name: string
  href: string
  icon: string // Now expecting string instead of component
}

interface SidebarNavAdminProps {
  menuLinks: MenuLink[]
}

export default function SidebarNavAdmin({ menuLinks }: SidebarNavAdminProps) {
  const pathname = usePathname()
  
  return (
    <nav className="mt-4 space-y-2">
      {menuLinks.map((item) => {
        // Get the icon component from the string
        const IconComponent = iconMap[item.icon]
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-zuree-red text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {IconComponent && <IconComponent className="h-4 w-4 mr-3" />}
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
