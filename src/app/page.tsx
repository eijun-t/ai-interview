'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Brain, 
  Target, 
  CheckCircle, 
  ArrowRight,
  PlayCircle,
  Star,
  TrendingUp,
  Shield,
  Sparkles,
  Zap,
  Award,
  LogIn
} from 'lucide-react';

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const { user, loading } = useAuth();

  const features = [
    {
      icon: <Brain className="h-7 w-7" />,
      title: "次世代AI面接官",
      description: "GPT-4を基盤とした高度な自然言語処理で、実際の面接官のような自然な対話を実現",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Target className="h-7 w-7" />,
      title: "業界特化型質問",
      description: "IT、金融、コンサル、製造業など、各業界の最新トレンドを反映した専門的な質問データベース",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="h-7 w-7" />,
      title: "AI分析フィードバック",
      description: "回答内容、論理構成、表現力を多角的に分析し、具体的な改善点を提示",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="h-7 w-7" />,
      title: "エンタープライズ級セキュリティ",
      description: "金融機関レベルの暗号化技術で個人情報を完全保護。GDPR準拠",
      color: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    {
      name: "田中 太郎",
      role: "東京大学 経済学部",
      company: "外資系コンサルティング内定",
      comment: "AI面接官の論理的思考を問う質問のおかげで、ケース面接で自信を持って答えることができました。第一志望の外資系コンサルから内定をいただけました。",
      rating: 5,
      avatar: "T"
    },
    {
      name: "佐藤 花子",
      role: "慶應義塾大学 法学部",
      company: "大手商社内定",
      comment: "忙しい就活の合間でも、24時間いつでも面接練習ができるのが本当に助かりました。特に志望動機の深掘り練習が効果的でした。",
      rating: 5,
      avatar: "S"
    },
    {
      name: "山田 次郎",
      role: "転職活動（5年目エンジニア）",
      company: "GAFA系企業転職成功",
      comment: "技術面接特化の質問が素晴らしく、システム設計やアルゴリズムの説明力が格段に向上しました。年収も200万円アップできました。",
      rating: 5,
      avatar: "Y"
    }
  ];

  const stats = [
    { number: "50,000+", label: "利用者数" },
    { number: "95%", label: "内定獲得率" },
    { number: "4.9/5", label: "満足度" },
    { number: "24/7", label: "利用可能" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* 浮遊する幾何学的シェイプ */}
      <div className="floating-shapes"></div>
      

      {/* ヒーローセクション */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center fade-in">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              GPT-4搭載の次世代AI面接システム
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              AI面接官で
              <span className="block text-gradient">完璧な面接準備</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              最新のAI技術を活用した模擬面接で、あなたの就職活動を成功に導きます。<br />
              実際の面接に近い環境で練習し、自信を持って本番に臨みましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              {/* 一時的にシンプルなバージョン */}
              <Link href="/demo">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <PlayCircle className="mr-3 h-6 w-6" />
                  無料デモを体験する
                  <ArrowRight className={`ml-3 h-6 w-6 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                </Button>
              </Link>
              <Button asChild variant="outline" size="lg" className="px-10 py-4 text-lg rounded-2xl border-2 hover:bg-gray-50 transition-all duration-300">
                <Link href="/auth/login">
                  <LogIn className="mr-3 h-5 w-5" />
                  ログイン
                </Link>
              </Button>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
              <Zap className="w-4 h-4 mr-2" />
              革新的な機能
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              なぜAI面接官が選ばれるのか
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              従来の面接練習では得られない、AIならではの革新的な特徴があります
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl w-fit mb-4 shadow-lg`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 geometric-pattern">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-4 h-4 mr-2" />
              簡単ステップ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              簡単3ステップで面接練習
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              すぐに始められる、シンプルな面接練習プロセス
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "面接タイプを選択",
                description: "新卒面接、中途面接、業界特化面接から最適なものを選択",
                icon: <Target className="h-8 w-8" />
              },
              {
                step: "2",
                title: "AI面接官と対話",
                description: "自然な会話形式で質問に答え、リアルタイムでフィードバックを受ける",
                icon: <MessageCircle className="h-8 w-8" />
              },
              {
                step: "3",
                title: "詳細分析を確認",
                description: "AIによる多角的な評価と具体的な改善点を確認し、スキルアップ",
                icon: <TrendingUp className="h-8 w-8" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center slide-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="relative mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-bold mx-auto shadow-2xl">
                    {item.step}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-xl text-white shadow-lg">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 体験談セクション */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-yellow-100 text-yellow-800 border-yellow-200">
              <Award className="w-4 h-4 mr-2" />
              成功事例
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              利用者の成功ストーリー
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              実際にAI面接官を使用して内定を獲得した方々の体験談
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-0 shadow-xl card-hover">
                <CardHeader className="pb-4">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {testimonial.role}
                      </CardDescription>
                      <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700 border-green-200">
                        {testimonial.company}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA（コール・トゥ・アクション）セクション */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            今すぐAI面接官で練習を始めましょう
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            無料で利用開始。クレジットカード不要。<br />
            あなたの夢の企業への第一歩を踏み出しましょう。
          </p>
          <Link href="/interview">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-4 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              <PlayCircle className="mr-3 h-6 w-6" />
              無料で面接練習を始める
            </Button>
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">AI面接官</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                AI技術で就職活動を成功に導く<br />
                次世代面接練習プラットフォーム
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6">機能</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors">AI面接練習</li>
                <li className="hover:text-white transition-colors">業界特化質問</li>
                <li className="hover:text-white transition-colors">詳細フィードバック</li>
                <li className="hover:text-white transition-colors">進捗管理</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6">サポート</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors">使い方ガイド</li>
                <li className="hover:text-white transition-colors">よくある質問</li>
                <li className="hover:text-white transition-colors">お問い合わせ</li>
                <li className="hover:text-white transition-colors">プライバシーポリシー</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6">会社情報</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors">会社概要</li>
                <li className="hover:text-white transition-colors">採用情報</li>
                <li className="hover:text-white transition-colors">ニュース</li>
                <li className="hover:text-white transition-colors">利用規約</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AI面接官. All rights reserved. | Powered by GPT-4</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
