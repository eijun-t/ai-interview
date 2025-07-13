'use client';

import { useState } from 'react';
import Image from 'next/image';

interface StaticAvatarProps {
  gender: 'male' | 'female';
  isAudioPlaying: boolean;
  onLoadComplete?: () => void;
}

export default function StaticAvatar({ 
  gender, 
  isAudioPlaying, 
  onLoadComplete 
}: StaticAvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const avatarSrc = gender === 'female' 
    ? '/avatars/female-interviewer.png' 
    : '/avatars/male-interviewer.png';

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoadComplete?.();
  };

  return (
    <div className="w-full h-96 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden flex items-center justify-center relative">
      {/* 音声再生中のインジケーター */}
      {isAudioPlaying && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          音声再生中
        </div>
      )}

      {/* アバター画像 */}
      <div className="relative w-80 h-80 rounded-full overflow-hidden shadow-xl">
        <Image
          src={avatarSrc}
          alt={`${gender === 'female' ? '女性' : '男性'}面接官`}
          fill
          className={`object-cover transition-all duration-300 ${
            isAudioPlaying ? 'scale-105' : 'scale-100'
          }`}
          onLoad={handleImageLoad}
          priority
        />
        
        {/* ローディング状態 */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        )}
      </div>

      {/* 面接官情報 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
        <div className="text-sm font-medium text-gray-800">
          AI面接官 {gender === 'female' ? '田中' : '佐藤'}
        </div>
        <div className="text-xs text-gray-600">
          {gender === 'female' ? '人事部' : '技術部'}マネージャー
        </div>
        <div className="text-xs text-blue-600 mt-1">
          🎵 {gender === 'female' ? '女性音声 (Nova)' : '男性音声 (Onyx)'}
        </div>
      </div>

      {/* 音声波形エフェクト（音声再生中のみ） */}
      {isAudioPlaying && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-blue-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}