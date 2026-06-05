import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { ClerkProvider } from '@clerk/react'
// Self-hosted fonts — no render-blocking Google CDN, no GDPR IP leak (UK company),
// faster LCP, and they render offline. Family names match existing classes:
// 'Inter', 'JetBrains Mono', and 'Bricolage Grotesque Variable' (display).
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource-variable/bricolage-grotesque'
import App from './App.jsx'
import './index.css'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const appTree = (
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  clerkPublishableKey ? (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      signInUrl="/signup?mode=sign-in"
      signUpUrl="/signup"
      afterSignOutUrl="/signup"
      signInFallbackRedirectUrl="/app/feed"
      signUpFallbackRedirectUrl="/app/feed"
    >
      {appTree}
    </ClerkProvider>
  ) : appTree,
)
