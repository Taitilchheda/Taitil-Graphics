'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'
import { FolderOpen, Plus, Calendar, User, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const mockProjects = [
  {
    id: '1',
    name: 'Business Card Design',
    description: 'Premium business cards for ABC Company',
    status: 'In Progress',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    type: 'Design'
  },
  {
    id: '2',
    name: 'Wedding Invitation Suite',
    description: 'Complete wedding invitation package',
    status: 'Completed',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    type: 'Invitations'
  },
  {
    id: '3',
    name: 'Logo Design Project',
    description: 'Brand identity for startup company',
    status: 'Review',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-19',
    type: 'Branding'
  }
]

export default function ProjectsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Required</h1>
            <p className="text-lg text-gray-600 mb-8">Please sign in to view your projects.</p>
            <Link href="/auth/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Review':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
            <p className="text-gray-600">Track and manage your design projects</p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {mockProjects.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Start your first project to see it here.</p>
            <button className="btn-primary">Create Project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProjects.map((project) => (
              <div key={project.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Type: {project.type}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 btn-primary">View Details</button>
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
