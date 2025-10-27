flowchart TD
  A[Visitor opens GossiperAI] --> B[Homepage displayed]
  B --> C{Clicks on public or private page?}
  C -->|Public| D[Access granted: view public content]
  C -->|Private| E{Is user logged in?}
  E -->|No| F[Redirect to Sign In page]
  F --> G[Option to Sign Up if no account]
  G --> H[After Sign Up → Redirect to Dashboard]
  E -->|Yes| I[Access private page]

  I --> J[Dashboard - Overview, Sessions, Settings]
  
  J --> K[Create Session]
  K --> L[Fill session details → Create]
  L --> M[Session created with join code]

  J --> N[Join Session]
  N --> O[Enter join code → Join session]

  M --> P[Host Session page - Mic + Live Caption]
  O --> Q[Participant Session page - Caption only]

  P --> R[Share code with participants]
  R --> Q