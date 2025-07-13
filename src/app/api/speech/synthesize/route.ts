import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 開発環境では認証をスキップ
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { text, gender } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // 性別に応じて音声を選択
    const voice = gender === 'male' ? 'onyx' : 'nova';

    try {
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
        },
      });
    } catch (openaiError) {
      console.error('OpenAI TTS error:', openaiError);
      
      // OpenAI APIエラーの場合は空の音声を返す（音声なしで継続）
      const emptyBuffer = Buffer.alloc(0);
      return new NextResponse(emptyBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': '0',
        },
      });
    }
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}