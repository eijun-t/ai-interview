import Link from 'next/link'
import SignUpForm from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <SignUpForm />
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          既にアカウントをお持ちの場合は{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}