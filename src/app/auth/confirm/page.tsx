'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ConfirmPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // URLからcode、token、typeパラメータを取得
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const token = urlParams.get('token');
        const type = urlParams.get('type');

        if (code) {
          // 認証コードを使用してセッションを確立
          const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (authError) {
            setError('認証の確認に失敗しました。再度お試しください。');
            setLoading(false);
            return;
          }
        } else if (token && type) {
          // 旧式のtoken/typeパラメータを処理
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change',
          });

          if (verifyError) {
            setError('認証の確認に失敗しました。再度お試しください。');
            setLoading(false);
            return;
          }
        } else {
          setError('無効な認証リンクです。');
          setLoading(false);
          return;
        }

        // 認証成功
        setLoading(false);
        
        // 3秒後にインタビューページにリダイレクト
        setTimeout(() => {
          router.push('/interview');
        }, 3000);

      } catch (err) {
        console.error('認証確認エラー:', err);
        setError('認証の確認中にエラーが発生しました。');
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証を確認しています...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">エラー</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ログインページに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
        <div className="text-green-500 text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">認証が完了しました</h1>
        <p className="text-gray-600 mb-6">
          メールアドレスの確認が完了しました。
          <br />
          まもなくインタビューページにリダイレクトします。
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/interview')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            今すぐ開始
          </button>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            ログインページ
          </button>
        </div>
      </div>
    </div>
  );
}