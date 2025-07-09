import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <LoginForm />
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          アカウントをお持ちでない場合は{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            新規登録
          </Link>
        </p>
        <p className="text-sm text-gray-600">
          パスワードを忘れた場合は{' '}
          <Link href="/auth/reset-password" className="text-blue-600 hover:underline">
            パスワードリセット
          </Link>
        </p>
      </div>
    </div>
  )
}