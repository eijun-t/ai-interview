'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InterviewSession from '@/components/interview/InterviewSession';
import { 
  MessageCircle, 
  ArrowLeft, 
  Search,
  Settings,
  Sparkles,
  Building2
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  description?: string;
  location?: string;
  employee_count?: string;
}

function InterviewPageContent() {
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [duration, setDuration] = useState(15);
  const category = '新卒採用';
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [manualCompanyName, setManualCompanyName] = useState('');

  useEffect(() => {
    const companyId = searchParams.get('company');
    if (companyId) {
      setSelectedCompany({ id: companyId, name: '指定企業' });
      setInterviewStarted(true);
    }
  }, [searchParams]);

  const searchCompanies = async (term: string) => {
    if (!term.trim()) {
      setCompanies([]);
      return;
    }

    try {
      const response = await fetch(`/api/companies/search?q=${encodeURIComponent(term)}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error searching companies:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCompanies(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const startInterview = () => {
    if (!selectedCompany) return;
    setInterviewStarted(true);
  };

  if (interviewStarted && selectedCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <nav className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Button 
                variant="ghost" 
                onClick={() => setInterviewStarted(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                面接設定に戻る
              </Button>
              <div className="flex items-center space-x-3">
                <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 px-4 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  面接中: {selectedCompany.name}
                </Badge>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <InterviewSession
            companyId={selectedCompany.id}
            companyName={selectedCompany.name}
            category={category}
            duration={duration}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <nav className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">ホームに戻る</span>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">AI面接官</span>
                <div className="text-xs text-gray-500 font-medium">Powered by GPT-4o</div>
              </div>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            AI面接練習システム
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            企業別面接練習
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            企業の特徴を反映したAI面接で、実践的な練習を行いましょう。<br />
            3D アバターとの音声対話で、よりリアルな面接体験を提供します。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* 企業選択 */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Building2 className="mr-3 h-6 w-6" />
              企業を選択
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-search">企業名で検索</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="company-search"
                    type="text"
                    placeholder="企業名を入力..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {companies.length > 0 && (
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                        selectedCompany?.id === company.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedCompany(company)}
                    >
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-gray-600">
                        {company.location || '所在地不明'}
                      </div>
                      {company.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{company.description}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {company.employee_count && `従業員: ${company.employee_count}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchTerm && companies.length === 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-sm text-yellow-800 mb-3">
                    「{searchTerm}」に一致する企業が見つかりませんでした。
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="manual-company">手動で企業名を入力</Label>
                    <Input
                      id="manual-company"
                      type="text"
                      placeholder="企業名を入力してください"
                      value={manualCompanyName}
                      onChange={(e) => setManualCompanyName(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (manualCompanyName.trim()) {
                          setSelectedCompany({
                            id: 'manual-' + Date.now(),
                            name: manualCompanyName.trim()
                          });
                          setManualCompanyName('');
                        }
                      }}
                      disabled={!manualCompanyName.trim()}
                      className="w-full"
                    >
                      この企業で面接を受ける
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedCompany && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-900">選択中: {selectedCompany.name}</div>
                  <div className="text-sm text-blue-700">{selectedCompany.location || '企業選択済み'}</div>
                </div>
              )}
            </div>
          </Card>

          {/* 面接設定 */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Settings className="mr-3 h-6 w-6" />
              新卒採用面接設定
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">面接タイプ: 新卒採用</h3>
                <p className="text-sm text-blue-700">
                  新卒採用に特化した面接質問を生成します
                </p>
              </div>
              
              <div>
                <Label htmlFor="duration">面接時間（分）</Label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value={10}>10分（短縮版）</option>
                  <option value={15}>15分（標準）</option>
                  <option value={20}>20分（詳細）</option>
                  <option value={30}>30分（本格版）</option>
                </select>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">面接内容</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 企業の特徴を反映した新卒向け質問</li>
                  <li>• リアルタイム音声での質疑応答</li>
                  <li>• 3D アバターとの対話</li>
                  <li>• 面接後の詳細評価とフィードバック</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={startInterview}
            disabled={!selectedCompany}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-16 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            <Sparkles className="mr-3 h-6 w-6" />
            {selectedCompany ? '面接を開始する' : '企業を選択してください'}
          </Button>
          {selectedCompany && (
            <p className="text-gray-500 mt-4">
              {selectedCompany.name} - 新卒採用面接 - {duration}分
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewPageContent />
    </Suspense>
  );
} 