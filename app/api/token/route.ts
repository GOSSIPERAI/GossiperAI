import { NextResponse } from 'next/server';
import { AssemblyAIService } from '@/services/transcription/lib/assemblyai';
import { getServerUser } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sessionUser = await getServerUser();

        if (!sessionUser) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const token = await AssemblyAIService.createTemporaryToken();
        return NextResponse.json({ token });
    } catch (error: any) {
        console.error('Failed to create temporary token:', error);
        return NextResponse.json(
            { error: 'Failed to create token', details: error.message },
            { status: 500 }
        );
    }
}
