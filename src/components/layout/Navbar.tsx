'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              AI Interview
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/interview" className="text-gray-700 hover:text-gray-900">
                  Interview
                </Link>
                <span className="text-gray-600">
                  {user.email}
                </span>
                <Button onClick={signOut} variant="outline">
                  ログアウト
                </Button>
              </>
            ) : (
              <div className="space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost">ログイン</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>新規登録</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}