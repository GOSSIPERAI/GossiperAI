flowchart TD
  %% Entry Points %%
  A[Visitor → /] --> B[Homepage]
  B --> C{Route type?}

  %% Public routes %%
  C -->|Public| D[Render directly]

  %% Private routes %%
  C -->|Private| E[Pass through Auth Middleware]
  E -->|Not Authenticated| F[Redirect → /signin]
  F --> G[Option → /signup]
  G --> H[After signup → /dashboard]

  %% Authenticated Flow %%
  E -->|Authenticated| I[Allow route access]

  %% Dashboard and internal pages %%
  I --> J[Dashboard (/dashboard)]
  J --> J1[Tabs: Overview | Sessions | Settings]
  J --> K[Create Session (/create-session)]
  J --> L[Join Session (/join-session)]

  %% Middleware details %%
  subgraph Middleware Flow
    M1[/_middleware.ts/]
    M1 --> M2{Request URL}
    M2 -->|Private| M3[Check Supabase Session Token]
    M3 -->|Invalid| F
    M3 -->|Valid| Continue[Proceed to requested route]
  end

  %% Session creation %%
  K --> K1[Form submission → Supabase insert(session)]
  K1 --> K2[Generate random session_code]
  K2 --> K3[Redirect to /session/:id]

  %% Session participation %%
  L --> L1[Input session_code]
  L1 --> L2[Query Supabase for matching session]
  L2 --> L3{Found?}
  L3 -->|Yes| L4[Redirect → /session/:id (participant)]
  L3 -->|No| L5[Display error: Invalid Code]

  %% Host/Participant pages %%
  K3 --> H1[Session Page (Host) → Mic Enabled]
  L4 --> H2[Session Page (Participant) → Mic Disabled]
  H1 -.->|Share code| L4