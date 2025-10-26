# Product Requirements Document (PRD)
## Gossiper - Real-Time AI Captions & Translation Platform

**Version:** 2.0.0  
**Date:** October 6, 2025  
**Platform:** Base (Ethereum L2)  
**Status:** Production Migration from Solana

---

## 1. Executive Summary

### 1.1 Product Vision
Gossiper is a blockchain-powered real-time transcription and translation platform that makes education accessible through collaborative micro-funding. Users can create or join live caption sessions, with AI-powered transcription in 50+ languages, funded by pooled contributions as low as ₦50 ($0.10 USD) via Base blockchain payments.

### 1.2 Problem Statement
- **International students** struggle to understand lectures in foreign languages
- **Deaf and hard-of-hearing students** need real-time captions but can't afford expensive tools ($100+ per session)
- **African languages** are underserved by existing accessibility tools
- **Payment barriers** prevent students from accessing assistive technology

### 1.3 Solution Overview
A unified dashboard where any user can:
1. **Create sessions** with real-time AI transcription (via AssemblyAI)
2. **Join sessions** to receive live captions in their preferred language
3. **Contribute micro-payments** via Base blockchain (USDC on Base)
4. **Collaborate** through pooled funding models

**Key Differentiator:** No role restrictions - everyone has access to the same unified interface with contextual capabilities based on session ownership.

---

## 2. Technical Architecture

### 2.1 Technology Stack

#### Frontend
- **Framework:** Next.js 14 (App Router) with React 18.3.1
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS 3.4 + Radix UI primitives
- **State Management:** React hooks + context

#### Blockchain Layer (Base Migration)
- **Network:** Base (Coinbase L2 on Ethereum)
- **Wallet Integration:** 
  - OnchainKit (@coinbase/onchainkit)
  - Wagmi 2.x + Viem
  - Base Account SDK (@base-org/account)
- **Payment Protocol:** Coinbase Commerce + USDC on Base
- **Smart Contracts:** Base-native payment pooling contracts

#### Backend Services
- **Hosting:** Vercel (Serverless Functions)
- **AI Transcription:** AssemblyAI API
- **Database:** PostgreSQL (via Vercel Postgres or Supabase)
- **Real-time:** WebSocket connections (upgrade from polling)
- **Authentication:** Wallet-based (Sign-In With Ethereum/Base)

### 2.2 Base Blockchain Integration

#### 2.2.1 Wallet Connection
```typescript
// OnchainKit Integration
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { base } from 'wagmi/chains';

// Configuration
{
  chain: base,
  wallet: {
    display: 'modal',
    supportedWallets: {
      coinbaseWallet: true,
      metamask: true,
      walletConnect: true,
    }
  }
}
```

#### 2.2.2 Payment Processing
- **Currency:** USDC on Base (stable, low fees ~$0.01 per transaction)
- **Smart Contract:** Payment pool aggregator
  - Collects contributions from multiple students
  - Releases funds to session creator when goal reached
  - Supports partial refunds if session cancelled
- **Gas Sponsorship:** Consider Coinbase Paymaster for gasless transactions

#### 2.2.3 Environment Variables
```env
# Base Configuration
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<coinbase_developer_platform_key>
NEXT_PUBLIC_WC_PROJECT_ID=<walletconnect_project_id>
NEXT_PUBLIC_BASE_NETWORK=base # or base-sepolia for testnet

# Commerce
NEXT_PUBLIC_COMMERCE_PRODUCT_ID=<coinbase_commerce_product_id>

# Existing
ASSEMBLYAI_API_KEY=<assemblyai_key>
DATABASE_URL=<postgres_connection_string>
NEXT_PUBLIC_APP_URL=https://gossiper.app
```

### 2.3 Data Flow Architecture

```
┌─────────────────┐
│   User Wallet   │
│  (Base/USDC)    │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         v              v
┌────────────────┐  ┌──────────────────┐
│ Create Session │  │  Join Session    │
│  (Speaker)     │  │  (Listener)      │
└────────┬───────┘  └────────┬─────────┘
         │                   │
         v                   v
┌─────────────────────────────────────┐
│      Unified Dashboard              │
│  - My Sessions (Created)            │
│  - Joined Sessions (Participating)  │
│  - Unified Stats & Analytics        │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│     Session Page (Live)             │
│  - Audio Capture (MediaRecorder)    │
│  - Real-time Captions Display       │
│  - Language Selection UI            │
│  - Payment Pool Progress            │
└────────┬────────────────────────────┘
         │
         ├──────────────┬──────────────┐
         v              v              v
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ AssemblyAI   │  │ WebSocket    │  │ Base Payment │
│ Transcribe   │  │ Real-time    │  │ Smart        │
│ + Translate  │  │ Updates      │  │ Contract     │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 3. User Roles & Flows

### 3.1 Unified User Model

**IMPORTANT:** Gossiper uses a **contextual role system**. There are no fixed "lecturer" or "student" accounts. Instead:

- **Session Creator Role:** When a user creates a session, they get creator privileges for that session
- **Session Participant Role:** When a user joins a session, they get participant privileges for that session
- **Same User, Multiple Roles:** A user can be a creator for some sessions and a participant in others

#### 3.1.1 User States
```typescript
interface User {
  walletAddress: string;           // Base wallet address (primary identifier)
  displayName?: string;            // Optional ENS or custom name
  preferredLanguage: string;       // Default caption language
  createdSessions: string[];       // Session IDs where user is creator
  joinedSessions: string[];        // Session IDs where user is participant
  totalContributions: number;      // Total USDC contributed
  accessibility: {
    highContrast: boolean;
    fontSize: 'default' | 'large' | 'xlarge';
    screenReaderOptimized: boolean;
  };
}
```

### 3.2 Primary User Flows

#### 3.2.1 Flow 1: Create & Host a Session

**Actor:** Any user with connected wallet  
**Goal:** Create a live captioning session for an event/lecture

**Steps:**
1. **Navigate to Dashboard** → Click "Create Session"
2. **Configure Session:**
   - Enter title (e.g., "Physics 101 - Newton's Laws")
   - Add description
   - Select start time
   - Choose original language (default: English)
   - Select available translation languages (multi-select from 50+ options)
   - Set session mode: Classroom / Conference / Podcast / Livestream
   - Configure payment pool:
     - Enable/disable contributions
     - Set goal amount (default ₦50-500 / $0.10-$1.00 USDC)
3. **Session Created:**
   - System generates unique 6-character join code (e.g., "ABC123")
   - Session appears in "My Sessions" section of dashboard
   - User receives shareable link: `gossiper.app/join?code=ABC123`
4. **Go Live:**
   - Click session → Redirected to Session Page
   - Grant microphone permission
   - Click "Start Recording" → Audio captured in 5-second chunks
   - Real-time transcription via AssemblyAI
   - Captions appear with <1 second latency
5. **Monitor Session:**
   - View participant count & languages
   - Track payment pool progress
   - See live caption quality indicators
6. **End Session:**
   - Click "Stop Recording" → Session marked as ended
   - Final transcripts saved
   - Payment pool automatically settled

**Success Criteria:**
- Session created in <3 seconds
- Join code generated and copyable
- Audio recording starts without errors
- Captions appear within 2 seconds of speech

#### 3.2.2 Flow 2: Join & Participate in a Session

**Actor:** Any user with connected wallet  
**Goal:** Access live captions in preferred language

**Steps:**
1. **Navigate to Dashboard** → Click "Join Session"
2. **Enter Join Code:**
   - Input 6-character code (e.g., "ABC123")
   - OR: Click shareable link directly
3. **Select Language:**
   - Choose preferred caption language from available options
   - System remembers preference for future sessions
4. **Enter Session:**
   - Redirected to Session Page
   - Live captions appear in selected language
   - Captions update in real-time as speaker talks
5. **Participate:**
   - Switch languages mid-session (toggle dropdown)
   - View other participants
   - See payment pool status
   - Optional: Contribute USDC via payment modal
6. **Contribute (Optional):**
   - Click "Contribute with USDC"
   - Payment modal appears with:
     - Suggested amount (₦50 / $0.10 USDC)
     - Custom amount option
     - Current pool progress
   - Confirm transaction via wallet
   - Contribution reflected in pool immediately
7. **Leave Session:**
   - Navigate away or close tab
   - Session remains in "Joined Sessions" on dashboard

**Success Criteria:**
- Join code validation in <1 second
- Session access granted without errors
- Captions display with <2 second latency
- Language switching instantaneous
- Payment transaction completes in <10 seconds

#### 3.2.3 Flow 3: Collaborative Payment Pool

**Actor:** Multiple session participants  
**Goal:** Collectively fund session costs through micro-contributions

**Steps:**
1. **Pool Initialization:**
   - Session creator sets goal amount during creation
   - Smart contract deployed on Base with pool parameters
   - Initial pool balance: 0 USDC
2. **Participant Contributions:**
   - Student A joins → Contributes ₦50 ($0.10 USDC)
   - Student B joins → Contributes ₦100 ($0.20 USDC)
   - Student C joins → Contributes ₦50 ($0.10 USDC)
   - Progress bar updates in real-time for all participants
3. **Pool Settlement:**
   - When goal reached: Funds released to session creator
   - When session ends without reaching goal:
     - Option A: Pro-rata distribution to creator
     - Option B: Funds returned to contributors
4. **Transparency:**
   - All contributions visible on Base block explorer
   - Transaction hashes displayed in UI
   - Total contributors count shown

**Success Criteria:**
- Transaction fees <$0.01 per contribution
- Pool updates reflected in <5 seconds
- Settlement automatic and verifiable on-chain

---

## 4. Feature Requirements

### 4.1 Core Features (MVP - Current Implementation)

#### 4.1.1 Unified Dashboard
**Status:** ✅ Implemented (needs Base migration)

**Components:**
- **Header Section:**
  - Welcome message with user's wallet address (truncated)
  - Action buttons: "Create Session" | "Join Session"
  - Wallet balance display (USDC on Base)
  - Disconnect wallet button

- **Stats Cards (5 cards):**
  1. **Created Sessions:** Total count of sessions user has created
  2. **Joined Sessions:** Total count of sessions user has participated in
  3. **Total Hours:** Cumulative time across all sessions
  4. **Contributions:** Total USDC contributed across sessions
  5. **Favorite Language:** Most-used caption language

- **Tab Navigation:**
  - **Overview Tab:**
    - "My Sessions" section (sessions created by user)
    - "Joined Sessions" section (sessions user participated in)
  - **All Sessions Tab:**
    - Combined view with search/filter
    - Grouped by session type
  - **Settings Tab:**
    - Language preferences
    - Accessibility settings
    - Notification preferences

**Technical Requirements:**
- Fetch user's created sessions: `GET /api/sessions?creator=${walletAddress}`
- Fetch user's joined sessions: `GET /api/sessions?participant=${walletAddress}`
- Display mock data while API is being built
- Responsive design: Mobile (1 col) → Tablet (2 cols) → Desktop (3+ cols)

#### 4.1.2 Session Creation
**Status:** ✅ Implemented (needs Base migration)

**Form Fields:**
- Session title (required, max 100 chars)
- Description (optional, max 500 chars)
- Start time (datetime picker, min: now)
- Session mode (dropdown: Classroom / Conference / Podcast / Livestream)
- Original language (dropdown, default: English)
- Available translation languages (multi-select checkboxes)
- Payment settings:
  - Enable contributions (checkbox)
  - Goal amount (number input, ₦10-1000 range)

**Validation:**
- Title required
- At least 1 language selected
- Start time in future (for scheduled sessions)
- Goal amount positive number

**Output:**
- Session ID generated (UUID)
- Join code generated (6-char alphanumeric)
- Session stored in database
- User redirected to session page

**Base Migration Changes:**
- Replace Solana Pay with Coinbase Commerce
- Deploy payment pool smart contract on Base
- Update currency references: SOL → USDC

#### 4.1.3 Session Join Flow
**Status:** ✅ Implemented (needs validation improvements)

**Join Methods:**
1. **Via Join Code:**
   - Input field with real-time validation
   - Error handling for invalid codes
2. **Via Direct Link:**
   - URL format: `/join?code=ABC123`
   - Auto-populate code field
3. **Via Dashboard:**
   - Click session card from "Joined Sessions"
   - Direct navigation to session page

**Pre-Join Screen:**
- Display session title, creator name, participant count
- Language selection dropdown
- "Join Session" confirmation button
- Wallet connection prompt if not connected

**Validation:**
- Check session exists
- Check session is active (not ended)
- Check wallet connected
- Verify user not already in session (allow rejoin)

#### 4.1.4 Live Session Interface
**Status:** ✅ Implemented (needs WebSocket upgrade)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Navigation Bar                                       │
│ [Logo] [Session Title]    [Live Badge] [Disconnect] │
├─────────────────────────────────────────────────────┤
│ Session Header                                       │
│ [Title] [Creator] [Time] [Participants]              │
│ [Join Code] [Share Button] [Fullscreen Toggle]       │
├─────────────────────────────────────────────────────┤
│ Audio Controls Bar                                   │
│ [Language: English ▼] [Mute] [Mic: ON/OFF]          │
├───────────────────────────────┬─────────────────────┤
│                               │                     │
│   CAPTIONS DISPLAY            │   SIDEBAR           │
│   (Main Content Area)         │                     │
│                               │   - Payment Pool    │
│   - Large readable text       │   - Participants    │
│   - Auto-scroll               │   - Session Info    │
│   - Timestamp markers         │                     │
│   - Confidence indicators     │                     │
│                               │                     │
└───────────────────────────────┴─────────────────────┘
```

**Caption Display (for Session Creators):**
- Component: `CaptionDisplay`
- Real-time captions with AssemblyAI
- Confidence score color coding:
  - Green: >0.9 confidence
  - Yellow: 0.7-0.9 confidence
  - Red: <0.7 confidence
- Auto-scroll to latest caption
- Manual scroll locks auto-scroll
- Fullscreen mode available

**Transcription Display (for Participants):**
- Component: `TranscriptionDisplay`
- Same visual layout as CaptionDisplay
- Receives captions via polling (to be replaced with WebSocket)
- Language switching triggers re-fetch with translation
- Accessibility optimized (WCAG 2.1 AA)

**Audio Recording (Creator Only):**
- MediaRecorder API with WebM/Opus codec
- 5-second chunks for continuous transcription
- Visual recording indicator (pulsing red dot)
- 60-second auto-stop timer (to be removed)
- Microphone permission prompt
- Error handling for permission denial

**Sidebar Components:**
1. **Payment Pool Card:**
   - Progress bar showing goal completion
   - Current amount / Goal amount (₦ display)
   - Contributor count
   - "Contribute with USDC" button (participants only)
   - Transaction history (optional)

2. **Participants List:**
   - Name + Language badge for each participant
   - Online/offline status indicators
   - Contributor badges (💎 for those who paid)

#### 4.1.5 Base Payment Integration
**Status:** 🔄 To Be Implemented

**Payment Modal (for participants):**
- Trigger: Click "Contribute with USDC"
- Modal displays:
  - Session title
  - Current pool status
  - Suggested amount (₦50 / $0.10 USDC)
  - Custom amount input
  - Payment breakdown:
    - Amount in USDC
    - Network fee (<$0.01 on Base)
    - Total
  - "Pay with Base" button
  - OnchainKit Checkout integration

**Payment Flow:**
```typescript
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';

<Checkout productId={COMMERCE_PRODUCT_ID}>
  <CheckoutButton 
    coinbaseBranded={true} 
    text="Contribute ₦50 ($0.10 USDC)"
  />
  <CheckoutStatus />
</Checkout>
```

**Smart Contract Interaction:**
```solidity
// Simplified Payment Pool Contract (Base)
contract SessionPaymentPool {
  address public creator;
  uint256 public goalAmount;
  uint256 public currentAmount;
  mapping(address => uint256) public contributions;
  
  function contribute() external payable {
    require(msg.value > 0, "Amount must be positive");
    contributions[msg.sender] += msg.value;
    currentAmount += msg.value;
    emit Contribution(msg.sender, msg.value);
  }
  
  function withdraw() external {
    require(msg.sender == creator, "Only creator");
    require(currentAmount >= goalAmount, "Goal not reached");
    payable(creator).transfer(currentAmount);
  }
}
```

**Post-Payment Actions:**
- Show success toast notification
- Update pool progress bar immediately
- Add contributor badge to participant list
- Store transaction hash for verification
- Emit event for other participants to refresh

#### 4.1.6 AI Transcription (AssemblyAI)
**Status:** ✅ Implemented (needs optimization)

**Current Implementation:**
- Endpoint: `/api/transcription/transcribe`
- Method: POST with audio file (FormData)
- Response: Job ID for tracking
- Webhook: `/api/transcription/webhook` receives results
- Callback: `/api/transcription/callback` for polling results

**Request Flow:**
```typescript
// 1. Client uploads audio chunk
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm');
formData.append('callbackUrl', `${APP_URL}/api/transcription/callback`);
formData.append('languageCode', selectedLanguage);

const response = await fetch('/api/transcription/transcribe', {
  method: 'POST',
  body: formData,
});
const { jobId } = await response.json();

// 2. Client polls for results
const pollResults = async () => {
  const res = await fetch(`/api/transcription/callback?sessionId=${sessionId}`);
  const { results } = await res.json();
  return results;
};
```

**AssemblyAI Configuration:**
```typescript
{
  language_code: 'en', // or selected language
  punctuate: true,
  format_text: true,
  speaker_labels: true, // for multi-speaker detection
  auto_highlights: false,
  dual_channel: false,
  webhook_url: `${APP_URL}/api/transcription/webhook`,
  webhook_auth_header_name: 'X-Webhook-Secret',
  webhook_auth_header_value: process.env.WEBHOOK_SECRET,
}
```

**Supported Languages (50+):**
- English (en), Yoruba (yo), French (fr), Spanish (es)
- Portuguese (pt), Arabic (ar), Chinese (zh), Hindi (hi)
- Swahili (sw), Hausa (ha), and 40+ more

**Translation Flow:**
- Original language transcribed first
- Translation requested for selected language
- Both stored with session ID
- Cached for subsequent language switches

---

### 4.2 Critical Improvements (High Priority)

#### 4.2.1 WebSocket Real-Time Communication
**Status:** 🔴 Critical - Replace Polling

**Current Issue:**
- Client polls `/api/transcription/callback` every 2 seconds
- High server load, poor real-time performance
- Increased latency and costs

**Solution: WebSocket Implementation**

**Backend (WebSocket Server):**
```typescript
// app/api/ws/route.ts (Next.js 14 Route Handler)
import { Server } from 'socket.io';

export async function GET(req: Request) {
  const io = new Server({
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL }
  });
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join session room
    socket.on('join-session', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
    });
    
    // Leave session room
    socket.on('leave-session', (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  return new Response('WebSocket initialized', { status: 200 });
}

// Emit transcription to session room
export function emitTranscription(sessionId: string, transcription: any) {
  io.to(`session:${sessionId}`).emit('transcription', transcription);
}
```

**Frontend (WebSocket Client):**
```typescript
// hooks/use-websocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(sessionId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [transcriptions, setTranscriptions] = useState<any[]>([]);
  
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || '', {
      transports: ['websocket'],
    });
    
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      newSocket.emit('join-session', sessionId);
    });
    
    newSocket.on('transcription', (data: any) => {
      setTranscriptions(prev => [...prev, data]);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.emit('leave-session', sessionId);
      newSocket.disconnect();
    };
  }, [sessionId]);
  
  return { socket, transcriptions };
}
```

**Migration Steps:**
1. Install dependencies: `pnpm add socket.io socket.io-client`
2. Create WebSocket route handler
3. Update transcription webhook to emit via WebSocket
4. Replace `useTranscription` polling with `useWebSocket`
5. Test with multiple concurrent sessions

**Benefits:**
- <500ms latency (vs 2+ seconds with polling)
- 90% reduction in server requests
- Better scalability
- Real-time participant updates

#### 4.2.2 Backend Authentication System
**Status:** 🔴 Critical - Replace localStorage

**Current Issue:**
- User state stored in localStorage
- No backend validation
- Session data in localStorage (lost on clear)
- No security against tampering

**Solution: JWT + Database Authentication**

**Database Schema (PostgreSQL):**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  preferred_language VARCHAR(5) DEFAULT 'en',
  accessibility_settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  join_code VARCHAR(6) UNIQUE NOT NULL,
  original_language VARCHAR(5),
  available_languages VARCHAR(5)[],
  mode VARCHAR(20),
  status VARCHAR(20) DEFAULT 'scheduled',
  payment_pool_id UUID,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Session participants
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  user_id UUID REFERENCES users(id),
  selected_language VARCHAR(5),
  has_contributed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  UNIQUE(session_id, user_id)
);

-- Transcriptions
CREATE TABLE transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  text TEXT NOT NULL,
  language VARCHAR(5),
  confidence DECIMAL(3,2),
  speaker_label VARCHAR(10),
  timestamp TIMESTAMP DEFAULT NOW(),
  assemblyai_job_id VARCHAR(100)
);

-- Payment pools
CREATE TABLE payment_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) UNIQUE,
  goal_amount DECIMAL(10,2),
  current_amount DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USDC',
  smart_contract_address VARCHAR(42),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contributions
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_pool_id UUID REFERENCES payment_pools(id),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2),
  transaction_hash VARCHAR(66) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_creator ON sessions(creator_id);
CREATE INDEX idx_sessions_join_code ON sessions(join_code);
CREATE INDEX idx_participants_session ON session_participants(session_id);
CREATE INDEX idx_participants_user ON session_participants(user_id);
CREATE INDEX idx_transcriptions_session ON transcriptions(session_id);
```

**Authentication Flow:**
```typescript
// 1. Sign-In With Ethereum/Base (SIWE)
import { createSiweMessage } from 'viem/siwe';
import { useSignMessage } from 'wagmi';

const { signMessage } = useSignMessage();

// Generate SIWE message
const message = createSiweMessage({
  address: walletAddress,
  chainId: base.id,
  domain: 'gossiper.app',
  nonce: await fetchNonce(), // From backend
  uri: 'https://gossiper.app',
  version: '1',
});

// User signs message
const signature = await signMessage({ message });

// Send to backend for verification
const response = await fetch('/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, signature }),
});

const { token } = await response.json();
// Store JWT in httpOnly cookie (set by backend)
```

**Backend Verification:**
```typescript
// app/api/auth/verify/route.ts
import { verifyMessage } from 'viem';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const { message, signature } = await req.json();
  
  // Verify SIWE signature
  const isValid = await verifyMessage({
    message,
    signature,
  });
  
  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Extract wallet address from message
  const address = extractAddress(message);
  
  // Get or create user
  const user = await db.users.upsert({
    where: { wallet_address: address },
    create: { wallet_address: address },
    update: { updated_at: new Date() },
  });
  
  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, walletAddress: user.wallet_address },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  // Set httpOnly cookie
  const response = Response.json({ success: true });
  response.headers.set('Set-Cookie', `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/`);
  
  return response;
}
```

**Protected API Routes:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-wallet-address', decoded.walletAddress);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/session/:path*',
    '/create-session/:path*',
    '/api/sessions/:path*',
  ],
};
```

**Benefits:**
- Secure authentication with cryptographic verification
- No password management
- Session persistence across devices
- Database-backed user state
- Protected API routes

#### 4.2.3 Remove Audio Recording Limitations
**Status:** 🟡 Medium Priority

**Current Issues:**
- 60-second auto-stop timer
- Manual restart required
- Interrupts lecturer flow

**Solution: Continuous Recording**

```typescript
// Continuous recording with chunking
const startContinuousRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: { 
      echoCancellation: true, 
      noiseSuppression: true 
    } 
  });
  
  const recorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });
  
  // Process chunks as they become available
  recorder.ondataavailable = async (event) => {
    if (event.data.size > 0) {
      // Send chunk to transcription immediately
      await sendAudioChunk(event.data);
    }
  };
  
  // Start recording with 5-second chunks (timeslice)
  recorder.start(5000); // Chunk every 5 seconds
  
  // NO AUTO-STOP - continues until user manually stops
  return recorder;
};

// Stop only when user clicks "Stop Recording"
const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
};
```

**Benefits:**
- No interruptions during long lectures
- Continuous caption stream
- Better UX for creators

#### 4.2.4 Enhanced Error Handling
**Status:** 🟡 Medium Priority

**Current Issues:**
- Basic error messages
- No retry logic
- Poor debugging information

**Solution: Comprehensive Error System**

```typescript
// Error types
enum ErrorCode {
  AUDIO_PERMISSION_DENIED = 'AUDIO_PERMISSION_DENIED',
  TRANSCRIPTION_FAILED = 'TRANSCRIPTION_FAILED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
}

interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string; // User-friendly message
  action?: string; // Suggested action
  details?: any;
}

// Error handler hook
const useErrorHandler = () => {
  const showError = (error: AppError) => {
    toast.error(error.userMessage, {
      action: error.action ? {
        label: error.action,
        onClick: () => handleErrorAction(error.code),
      } : undefined,
    });
    
    // Log to monitoring service
    logError(error);
  };
  
  return { showError };
};

// Retry logic for transient failures
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
};

// Usage
try {
  const result = await withRetry(() => 
    fetch('/api/transcription/transcribe', { ... })
  );
} catch (error) {
  showError({
    code: ErrorCode.TRANSCRIPTION_FAILED,
    message: error.message,
    userMessage: 'Failed to send audio for transcription. Please try again.',
    action: 'Retry',
  });
}
```

---

### 4.3 Additional Features (Roadmap)

#### 4.3.1 Session Recording & Export
**Priority:** Low  
**Timeline:** Q2 2025

- Download full session transcript (PDF, TXT, SRT)
- Export captions with timestamps
- Audio recording download
- Searchable transcript archive

#### 4.3.2 Advanced Analytics
**Priority:** Medium  
**Timeline:** Q2 2025

- Session engagement metrics
- Popular language combinations
- Payment pool trends
- User retention statistics

#### 4.3.3 Mobile App (React Native)
**Priority:** Medium  
**Timeline:** Q3 2025

- Native iOS/Android apps
- Mobile Wallet Protocol integration
- Push notifications for session starts
- Offline caption caching

#### 4.3.4 Admin Dashboard
**Priority:** Low  
**Timeline:** Q3 2025

- User management
- Session moderation
- System analytics
- Payment monitoring

---

## 5. Non-Functional Requirements

### 5.1 Performance

- **Page Load:** <2 seconds on 4G connection
- **Time to Interactive:** <3 seconds
- **Caption Latency:** <2 seconds from speech to display
- **WebSocket Message Delivery:** <500ms
- **Payment Transaction:** <10 seconds end-to-end
- **Concurrent Sessions:** Support 100+ simultaneous sessions
- **Concurrent Users per Session:** Support 100+ participants

### 5.2 Scalability

- **Serverless Architecture:** Auto-scaling with Vercel
- **Database Connection Pooling:** PgBouncer for PostgreSQL
- **CDN:** Vercel Edge Network for static assets
- **Caching:**
  - Session data cached for 60 seconds
  - Transcriptions cached indefinitely
  - User profiles cached for 5 minutes

### 5.3 Security

- **Authentication:** SIWE (Sign-In With Ethereum/Base)
- **API Protection:** JWT tokens in httpOnly cookies
- **Rate Limiting:**
  - 100 requests/minute per IP for public endpoints
  - 500 requests/minute for authenticated users
- **CORS:** Strict origin validation
- **SQL Injection:** Parameterized queries via Prisma ORM
- **XSS Protection:** React's built-in sanitization + CSP headers
- **CSRF Protection:** SameSite cookies + CSRF tokens

### 5.4 Accessibility (WCAG 2.1 AA Compliance)

#### 5.4.1 Visual Accessibility
- **Color Contrast:** 4.5:1 minimum for text
- **Font Sizes:**
  - Base: 16px
  - Large: 20px
  - X-Large: 24px
- **High Contrast Mode:** Toggle for enhanced visibility
- **Focus Indicators:** 2px solid outline on all interactive elements

#### 5.4.2 Auditory Accessibility
- **Live Captions:** Real-time text for audio content
- **Visual Indicators:** Flashing icon when new caption arrives
- **Adjustable Caption Speed:** Pause/slow down caption display

#### 5.4.3 Motor Accessibility
- **Keyboard Navigation:** Full app navigable via keyboard
  - Tab order logical
  - Skip navigation links
  - Escape key closes modals
- **Large Click Targets:** Minimum 44x44px
- **No Time Limits:** User-controlled pace (except auto-stop removal)

#### 5.4.4 Cognitive Accessibility
- **Simple Language:** Clear, concise instructions
- **Consistent Layout:** Predictable UI patterns
- **Error Prevention:** Confirmation dialogs for destructive actions
- **Progress Indicators:** Loading states for all async operations

#### 5.4.5 Screen Reader Support
- **ARIA Labels:** All interactive elements labeled
- **Landmark Regions:** <nav>, <main>, <aside> properly used
- **Live Regions:** `aria-live="polite"` for caption updates
- **Alt Text:** All images have descriptive alt text

**Accessibility Testing Tools:**
- Lighthouse (automated testing)
- axe DevTools (manual testing)
- NVDA/JAWS screen readers (user testing)

### 5.5 Internationalization (i18n)

**Supported Languages:**
- **UI Languages:** English, French, Spanish, Portuguese (Phase 1)
- **Caption Languages:** 50+ via AssemblyAI
  - English, Yoruba, Hausa, Swahili (prioritized)
  - French, Spanish, Portuguese, Arabic, Chinese, Hindi
  - 40+ additional languages

**Implementation:**
- `next-intl` for UI translations
- AssemblyAI language detection
- Right-to-left (RTL) support for Arabic
- Currency formatting (₦, $, €, etc.)

---

## 6. Base Blockchain Migration Guide

### 6.1 Migration Steps

#### Phase 1: Development Environment (Week 1)
1. **Install Dependencies:**
   ```bash
   pnpm add @coinbase/onchainkit wagmi viem @tanstack/react-query
   pnpm add @coinbase/wallet-sdk @base-org/account
   ```

2. **Configure OnchainKit:**
   ```typescript
   // app/providers.tsx
   import { OnchainKitProvider } from '@coinbase/onchainkit';
   import { base, baseSepolia } from 'wagmi/chains';
   
   <OnchainKitProvider
     apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
     chain={baseSepolia} // Testnet first
     config={{
       appearance: {
         name: 'Gossiper',
         logo: '/gossiper-logo.png',
         mode: 'auto',
         theme: 'default',
       },
       wallet: {
         display: 'modal',
         supportedWallets: {
           coinbaseWallet: true,
           metamask: true,
           walletConnect: true,
         },
       },
     }}
   >
     {children}
   </OnchainKitProvider>
   ```

3. **Create Wagmi Config:**
   ```typescript
   // lib/wagmi.ts
   import { createConfig, http } from 'wagmi';
   import { base, baseSepolia } from 'wagmi/chains';
   import { coinbaseWallet } from 'wagmi/connectors';
   
   export const config = createConfig({
     chains: [baseSepolia, base],
     connectors: [
       coinbaseWallet({
         appName: 'Gossiper',
         preference: 'smartWalletOnly', // Prioritize smart wallets
       }),
     ],
     transports: {
       [baseSepolia.id]: http(),
       [base.id]: http(),
     },
   });
   ```

#### Phase 2: Smart Contract Development (Week 2)
1. **Install Foundry:**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Create Payment Pool Contract:**
   ```solidity
   // contracts/SessionPaymentPool.sol
   // SPDX-License-Identifier: MIT
   pragma solidity ^0.8.20;
   
   import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
   import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
   
   contract SessionPaymentPool is ReentrancyGuard {
       address public immutable creator;
       uint256 public immutable goalAmount;
       IERC20 public immutable usdcToken;
       
       uint256 public currentAmount;
       mapping(address => uint256) public contributions;
       bool public isActive = true;
       
       event Contribution(address indexed contributor, uint256 amount);
       event Withdrawal(address indexed creator, uint256 amount);
       event PoolClosed();
       
       constructor(
           address _creator,
           uint256 _goalAmount,
           address _usdcToken
       ) {
           creator = _creator;
           goalAmount = _goalAmount;
           usdcToken = IERC20(_usdcToken);
       }
       
       function contribute(uint256 amount) external nonReentrant {
           require(isActive, "Pool is not active");
           require(amount > 0, "Amount must be greater than 0");
           
           // Transfer USDC from contributor to contract
           require(
               usdcToken.transferFrom(msg.sender, address(this), amount),
               "Transfer failed"
           );
           
           contributions[msg.sender] += amount;
           currentAmount += amount;
           
           emit Contribution(msg.sender, amount);
       }
       
       function withdraw() external nonReentrant {
           require(msg.sender == creator, "Only creator can withdraw");
           require(currentAmount >= goalAmount, "Goal not reached");
           require(isActive, "Pool already closed");
           
           isActive = false;
           
           // Transfer all USDC to creator
           require(
               usdcToken.transfer(creator, currentAmount),
               "Transfer failed"
           );
           
           emit Withdrawal(creator, currentAmount);
           emit PoolClosed();
       }
       
       function getContribution(address contributor) external view returns (uint256) {
           return contributions[contributor];
       }
       
       function getProgress() external view returns (uint256 current, uint256 goal) {
           return (currentAmount, goalAmount);
       }
   }
   ```

3. **Deploy to Base Sepolia:**
   ```bash
   forge create --rpc-url $BASE_SEPOLIA_RPC_URL \
     --private-key $PRIVATE_KEY \
     --constructor-args $CREATOR_ADDRESS $GOAL_AMOUNT $USDC_ADDRESS \
     contracts/SessionPaymentPool.sol:SessionPaymentPool
   ```

#### Phase 3: Frontend Integration (Week 3)
1. **Replace Solana Wallet Components:**
   ```typescript
   // REMOVE:
   import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
   
   // ADD:
   import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
   import { Identity, Avatar, Name, Address } from '@coinbase/onchainkit/identity';
   
   // Component:
   <Wallet>
     <ConnectWallet>
       <Avatar className="h-6 w-6" />
       <Name />
     </ConnectWallet>
     <WalletDropdown>
       <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
         <Avatar />
         <Name />
         <Address />
       </Identity>
       <WalletDropdownDisconnect />
     </WalletDropdown>
   </Wallet>
   ```

2. **Update Payment Modal:**
   ```typescript
   // components/payment-modal.tsx
   import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';
   import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
   import { parseUnits } from 'viem';
   
   export function PaymentModal({ sessionId, poolAddress, onSuccess }) {
     const { writeContract, data: hash } = useWriteContract();
     const { isSuccess } = useWaitForTransactionReceipt({ hash });
     
     const handleContribute = async (amount: string) => {
       const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals
       
       // Approve USDC spending
       await writeContract({
         address: USDC_ADDRESS,
         abi: ERC20_ABI,
         functionName: 'approve',
         args: [poolAddress, amountInWei],
       });
       
       // Contribute to pool
       await writeContract({
         address: poolAddress,
         abi: PAYMENT_POOL_ABI,
         functionName: 'contribute',
         args: [amountInWei],
       });
     };
     
     useEffect(() => {
       if (isSuccess) {
         onSuccess();
       }
     }, [isSuccess]);
     
     return (
       <Modal>
         {/* Suggested amounts */}
         <Button onClick={() => handleContribute('0.10')}>
           Contribute $0.10 USDC
         </Button>
         {/* Custom amount input */}
         <Input placeholder="Custom amount" />
         <CheckoutStatus />
       </Modal>
     );
   }
   ```

3. **Update Dashboard:**
   ```typescript
   // Replace SOL balance with USDC balance
   import { useBalance } from 'wagmi';
   
   const { data: balance } = useBalance({
     address: walletAddress,
     token: USDC_ADDRESS, // USDC on Base
   });
   
   // Display: {balance?.formatted} USDC
   ```

#### Phase 4: Backend Updates (Week 4)
1. **Update Session Creation API:**
   ```typescript
   // app/api/sessions/create/route.ts
   import { createPublicClient, http } from 'viem';
   import { base } from 'viem/chains';
   
   export async function POST(req: Request) {
     const { title, goalAmount, creatorAddress } = await req.json();
     
     // Deploy payment pool contract
     const publicClient = createPublicClient({
       chain: base,
       transport: http(),
     });
     
     const poolAddress = await deployPaymentPool({
       creator: creatorAddress,
       goalAmount: parseUnits(goalAmount.toString(), 6),
     });
     
     // Save session to database
     const session = await db.sessions.create({
       data: {
         title,
         creator_id: userId,
         payment_pool: {
           create: {
             goal_amount: goalAmount,
             smart_contract_address: poolAddress,
           },
         },
       },
     });
     
     return Response.json({ session });
   }
   ```

2. **Listen for Contribution Events:**
   ```typescript
   // services/blockchain-listener.ts
   import { createPublicClient, http } from 'viem';
   import { base } from 'viem/chains';
   
   const publicClient = createPublicClient({
     chain: base,
     transport: http(),
   });
   
   // Watch for Contribution events
   publicClient.watchContractEvent({
     address: poolAddress,
     abi: PAYMENT_POOL_ABI,
     eventName: 'Contribution',
     onLogs: async (logs) => {
       for (const log of logs) {
         const { contributor, amount } = log.args;
         
         // Save contribution to database
         await db.contributions.create({
           data: {
             payment_pool_id: poolId,
             user_wallet: contributor,
             amount: formatUnits(amount, 6),
             transaction_hash: log.transactionHash,
             status: 'confirmed',
           },
         });
         
         // Emit WebSocket event to update UI
         io.to(`session:${sessionId}`).emit('contribution', {
           contributor,
           amount: formatUnits(amount, 6),
         });
       }
     },
   });
   ```

#### Phase 5: Testing & Deployment (Week 5-6)
1. **Testnet Testing:**
   - Deploy contracts to Base Sepolia
   - Test full payment flow with testnet USDC
   - Verify event listening
   - Test WebSocket real-time updates

2. **Mainnet Deployment:**
   - Deploy contracts to Base mainnet
   - Update environment variables
   - Enable production API keys
   - Monitor gas costs

3. **Migration Checklist:**
   - [ ] All Solana dependencies removed
   - [ ] Base smart contracts deployed
   - [ ] Frontend wallet integration complete
   - [ ] Payment flow tested end-to-end
   - [ ] Database schema updated
   - [ ] WebSocket events working
   - [ ] Transaction monitoring active
   - [ ] Documentation updated
   - [ ] Team trained on Base

### 6.2 Cost Comparison: Solana vs Base

| Metric | Solana | Base | Notes |
|--------|--------|------|-------|
| **Transaction Fee** | ~$0.00025 | ~$0.01 | Base 40x higher, but still affordable |
| **Confirmation Time** | ~400ms | ~2 seconds | Solana faster, but Base acceptable |
| **Wallet Compatibility** | Phantom, Solflare | Coinbase, MetaMask, WalletConnect | Base has wider adoption |
| **Developer Tools** | Anchor, web3.js | Foundry, Wagmi, Viem | Base has mature ecosystem |
| **Smart Contract Language** | Rust | Solidity | Solidity has larger developer pool |
| **USDC Support** | Native | Native | Both support USDC natively |
| **L1 Security** | Solana L1 | Ethereum L1 | Ethereum more established |
| **Ecosystem Size** | Medium | Large | Base benefits from Ethereum ecosystem |

**Recommendation:** Despite slightly higher fees, Base offers better ecosystem support, wider wallet compatibility, and easier onboarding for users already on Coinbase/Ethereum.

---

## 7. Success Metrics & KPIs

### 7.1 Product Metrics

| Metric | Target (Month 1) | Target (Month 3) | Measurement |
|--------|------------------|------------------|-------------|
| **Active Users** | 500 | 2,000 | Unique wallet addresses |
| **Sessions Created** | 100 | 500 | Total sessions in database |
| **Sessions Joined** | 300 | 1,500 | Total participants across sessions |
| **Payment Conversion** | 20% | 35% | % of participants who contribute |
| **Average Contribution** | $0.15 | $0.20 | Mean USDC per contribution |
| **Session Completion Rate** | 70% | 85% | % of started sessions that complete |

### 7.2 Technical Metrics

| Metric | Target | Monitoring |
|--------|--------|------------|
| **API Response Time** | <500ms (p95) | Vercel Analytics |
| **Caption Latency** | <2s (p95) | Custom logging |
| **WebSocket Uptime** | 99.5% | StatusPage |
| **Error Rate** | <1% | Sentry |
| **Transaction Success Rate** | >95% | Base block explorer API |

### 7.3 Business Metrics

| Metric | Target (Month 3) | Calculation |
|--------|------------------|-------------|
| **Total Value Locked (TVL)** | $500 | Sum of active payment pools |
| **Transaction Volume** | $1,000 | Total USDC processed |
| **Average Session Revenue** | $2.00 | Mean pool amount per session |
| **User Retention (Week 1)** | 40% | Users active in Week 2 |
| **User Retention (Month 1)** | 20% | Users active in Month 2 |

### 7.4 Accessibility Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Lighthouse Accessibility Score** | >90 | Automated testing |
| **Screen Reader Compatibility** | 100% | Manual testing with NVDA/JAWS |
| **Keyboard Navigation Coverage** | 100% | All features accessible via keyboard |
| **Caption Accuracy** | >90% | AssemblyAI confidence scores |

---

## 8. Risk Assessment & Mitigation

### 8.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **AssemblyAI API Downtime** | High | Low | Implement fallback transcription service (Deepgram) |
| **Base Network Congestion** | Medium | Low | Implement transaction retry logic + gas price monitoring |
| **WebSocket Disconnections** | Medium | Medium | Auto-reconnect with exponential backoff |
| **Database Overload** | High | Low | Connection pooling + read replicas |
| **Smart Contract Bug** | Critical | Low | Professional audit + bug bounty program |

### 8.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Low User Adoption** | Critical | Medium | Targeted marketing to universities + free trials |
| **Payment Friction** | High | Medium | Educational onboarding flow for wallet setup |
| **Regulatory Compliance** | High | Low | Consult legal team for crypto payment regulations |
| **Competition** | Medium | Medium | Focus on African language support as differentiator |

### 8.3 Security Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Wallet Draining Attack** | Critical | Low | Never request unlimited token approvals |
| **Session Hijacking** | High | Low | JWT expiration + secure cookie configuration |
| **DoS Attack** | Medium | Medium | Rate limiting + Vercel DDoS protection |
| **Data Breach** | High | Low | Encrypt sensitive data + regular security audits |

---

## 9. Implementation Timeline

### Phase 1: Foundation (Weeks 1-4)
- ✅ Design review & PRD finalization
- ✅ Base testnet setup
- ✅ Smart contract development & audit
- ✅ Database schema migration
- ✅ WebSocket server implementation

### Phase 2: Frontend Migration (Weeks 5-8)
- 🔄 Replace Solana wallet with OnchainKit
- 🔄 Integrate Base payment flow
- 🔄 Update dashboard with Base data
- 🔄 Implement WebSocket client
- 🔄 Remove localStorage dependencies

### Phase 3: Backend Services (Weeks 9-12)
- 🔄 Implement SIWE authentication
- 🔄 Create REST API endpoints
- 🔄 Set up blockchain event listeners
- 🔄 Migrate AssemblyAI integration
- 🔄 Deploy to production

### Phase 4: Testing & Optimization (Weeks 13-16)
- ⏳ End-to-end testing on Base Sepolia
- ⏳ Performance optimization
- ⏳ Accessibility audit
- ⏳ Security penetration testing
- ⏳ User acceptance testing

### Phase 5: Launch (Weeks 17-20)
- ⏳ Mainnet deployment
- ⏳ Marketing campaign
- ⏳ University partnerships
- ⏳ Community building
- ⏳ Post-launch monitoring

---

## 10. Appendix

### 10.1 Glossary

- **Base:** Ethereum Layer 2 blockchain developed by Coinbase
- **USDC:** USD Coin, a stablecoin pegged 1:1 to the US Dollar
- **OnchainKit:** Coinbase's SDK for building onchain applications
- **SIWE:** Sign-In With Ethereum, a wallet-based authentication standard
- **AssemblyAI:** AI-powered speech-to-text API with translation
- **WebSocket:** Protocol for full-duplex communication over TCP
- **Payment Pool:** Smart contract that aggregates contributions from multiple users

### 10.2 API Endpoints Reference

#### Authentication
```
POST /api/auth/verify
Body: { message: string, signature: string }
Response: { success: boolean }
```

#### Sessions
```
GET /api/sessions?creator=<address>&participant=<address>
Response: { sessions: Session[] }

POST /api/sessions/create
Body: { title, description, startTime, originalLanguage, availableLanguages, mode, paymentGoal }
Response: { session: Session, joinCode: string }

GET /api/sessions/:id
Response: { session: Session }

POST /api/sessions/:id/join
Body: { selectedLanguage: string }
Response: { success: boolean }
```

#### Transcription
```
POST /api/transcription/transcribe
Body: FormData (audio file)
Response: { jobId: string }

POST /api/transcription/webhook
Body: AssemblyAI webhook payload
Response: { success: boolean }

GET /api/transcription/results?sessionId=<id>
Response: { results: Transcription[] }
```

#### Payments
```
GET /api/payments/pool/:sessionId
Response: { pool: PaymentPool, contributions: Contribution[] }

POST /api/payments/verify
Body: { transactionHash: string, sessionId: string }
Response: { success: boolean, contribution: Contribution }
```

### 10.3 Environment Variables

**Required:**
```env
# Base Blockchain
NEXT_PUBLIC_ONCHAINKIT_API_KEY=
NEXT_PUBLIC_WC_PROJECT_ID=
NEXT_PUBLIC_BASE_NETWORK=base

# Coinbase Commerce
NEXT_PUBLIC_COMMERCE_PRODUCT_ID=

# Database
DATABASE_URL=postgresql://...

# AssemblyAI
ASSEMBLYAI_API_KEY=

# Application
NEXT_PUBLIC_APP_URL=https://gossiper.app
JWT_SECRET=<random_256_bit_key>
```

**Optional:**
```env
# Development
NEXT_PUBLIC_BASE_NETWORK=base-sepolia
NEXT_PUBLIC_DEBUG=true

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_ANALYTICS_ID=
```

### 10.4 Smart Contract Addresses

**Base Sepolia (Testnet):**
```
USDC Token: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
SessionPaymentPool Factory: <to_be_deployed>
```

**Base Mainnet (Production):**
```
USDC Token: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
SessionPaymentPool Factory: <to_be_deployed>
```

### 10.5 Support & Documentation

- **Developer Docs:** https://docs.gossiper.app
- **Base Documentation:** https://docs.base.org
- **OnchainKit Docs:** https://onchainkit.xyz
- **AssemblyAI Docs:** https://www.assemblyai.com/docs
- **Support Email:** support@gossiper.app
- **Discord Community:** https://discord.gg/gossiper

---

**Document Version:** 2.0.0  
**Last Updated:** October 6, 2025  
**Next Review:** January 6, 2026  
**Maintained By:** Gossiper Product Team

