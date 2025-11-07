// components/debug-toggle.tsx
// Debug component to show current transcription mode
// Only visible in development or when explicitly enabled

'use client';

import { Badge } from '@/components/ui/badge';
import { USE_STREAMING } from '@/lib/config';

export function DebugToggle() {
  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SHOW_DEBUG_TOGGLE !== 'true') {
    return null;
  }

  return (
    <Badge 
      variant={USE_STREAMING ? "default" : "outline"}
      className="fixed bottom-4 right-4 z-50"
      title={`Transcription mode: ${USE_STREAMING ? 'Streaming' : 'Pre-recorded'}`}
    >
      {USE_STREAMING ? '🔴 Streaming' : '📼 Pre-recorded'}
    </Badge>
  );
}

