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

    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    try {
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'ja',
      });

      return NextResponse.json({ text: transcription.text });
    } catch (openaiError) {
      console.error('OpenAI Whisper error:', openaiError);
      
      // OpenAI APIエラーの場合はダミーテキストを返す
      return NextResponse.json({ 
        text: "音声認識ができませんでした。テキストで回答を入力してください。" 
      });
    }
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}