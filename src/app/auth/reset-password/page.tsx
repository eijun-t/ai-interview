import Link from 'next/link'
import PasswordResetForm from '@/components/auth/PasswordResetForm'

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <PasswordResetForm />
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          ログインページに戻る{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}