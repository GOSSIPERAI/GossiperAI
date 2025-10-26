# 🎤 Gossiper: Real-Time Captions & Translation

> **Live captions and translation for education** - Students get real-time captions in their language. Pay as little as ₦50 to join a session.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Web3.js-purple?style=flat-square&logo=solana)](https://solana.com/)
[![AssemblyAI](https://img.shields.io/badge/AssemblyAI-AI%20Transcription-orange?style=flat-square)](https://assemblyai.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

## What Is Gossiper?

Students join lecture sessions and get live captions in their language, paying as little as ₦50 to collectively fund the session.

### Problems We Solve

- International students can't understand lectures in foreign languages
- Deaf and hard-of-hearing students need real-time captions
- Accessibility tools cost too much for students ($100s per session)
- Current solutions don't support African languages

### How to Use

**Students:**
1. Connect your Solana wallet (Phantom or Solflare - no signup needed)
2. Enter the session code your lecturer shared
3. Pick your language (50+ languages including Yoruba, Swahili, Hausa)
4. See live captions appear as the lecturer speaks
5. Pay ₦50 to help fund the session for everyone

**Lecturers:**
1. Create a session
2. Share the join code with students
3. Start speaking - captions appear automatically with screen reader support
4. Track collective funding from all students

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Solana, Phantom/Solflare wallets
- **AI**: AssemblyAI for speech-to-text
- **Payments**: Solana Pay
- **Deployment**: Vercel

## Setup

### Requirements

- Node.js 18+
- pnpm
- Solana wallet (Phantom or Solflare)
- AssemblyAI API key

### Install

1. Clone the repo
   ```bash
   git clone <repository-url>
   cd gossiper
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Add environment variables to `.env.local`:
   ```env
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   ASSEMBLYAI_API_KEY=your_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Start the app
   ```bash
   pnpm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)


## 🌟 Key Features

### 🎤 Real-Time Transcription
- **Sub-second latency** using AssemblyAI's advanced models
- **50+ languages** including African languages (Yoruba, Swahili, Hausa)
- **Confidence scoring** for transcription accuracy
- **Multiple audio formats** supported (WebM, MP3, WAV)

### 💰 Collaborative Funding
- **Micro-payments** starting from ₦50 ($0.10)
- **Pool-based funding** - students contribute collectively
- **Solana Pay integration** for seamless transactions
- **Transparent tracking** of funding progress

### 🔐 Wallet-Only Authentication
- **No passwords** - just connect your Solana wallet
- **Phantom/Solflare** support out of the box
- **Secure** - your keys, your identity

### 🌍 Accessibility First
- **WCAG 2.1 AA compliant** design
- **High contrast modes** for visual accessibility
- **Screen reader support** for blind users
- **Keyboard navigation** and font scaling

## 🔧 Architecture

```
Audio Input → AssemblyAI → Webhook → Live Captions → Translation → User Interface
Student Wallet → Solana Pay → Session Pool → Lecturer Wallet
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
ASSEMBLYAI_API_KEY=your_production_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🧪 Development

### Available Scripts
```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
```

### Project Structure
```
gossiper/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── create-session/    # Session creation
│   ├── session/[id]/      # Live session pages
│   └── join-session/      # Session joining
├── components/            # React components
│   ├── ui/               # Radix UI components
│   └── solana-wallet-provider.tsx
├── hooks/                # Custom React hooks
├── services/             # External service integrations
│   └── transcription/    # AssemblyAI integration
└── lib/                  # Utility functions
```

## 🌐 Supported Languages

- **English** (en)
- **Yoruba** (yo) - Nigerian language
- **French** (fr)
- **Spanish** (es)
- **Portuguese** (pt)
- **Arabic** (ar)
- **Chinese** (zh)
- **Hindi** (hi)
- **Swahili** (sw) - East African language
- **Hausa** (ha) - West African language

## 🎯 Impact & Innovation

### Social Impact
- **Educational accessibility** - Deaf and hard-of-hearing students get real-time captions at 99% lower cost than traditional tools
- **Language barrier removal** - International students can understand lectures in their native language
- **Affordable access** - Collaborative funding model lets students pay as little as ₦50 ($0.10)
- **African languages** - First-class support for Yoruba, Swahili, and Hausa

### Use Cases

**Educational Institutions**
- Universities: Support international students in lectures
- Online courses: Real-time captions for video content
- Language learning: Practice listening with captions

**Corporate & Events**
- Remote meetings with multi-language support
- Accessible webinars and presentations
- Live streaming with real-time captions

### What Makes This Special
- **First-of-its-kind** integration of real-time AI transcription with Solana micro-payments
- **Production-ready** with serverless architecture, WebSocket connections, and proper error handling
- **Truly accessible** with WCAG 2.1 AA compliance - works with screen readers and keyboard navigation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AssemblyAI** for speech-to-text capabilities
- **Solana** for blockchain infrastructure and micro-payments
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **Next.js** for the React framework
- **Vercel** for deployment platform

---

**Built with ❤️ for accessible education**

*Making every voice heard, in every language, for every student.*