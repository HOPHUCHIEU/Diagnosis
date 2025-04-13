import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@/css/index.css'
import './i18n/i18n'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProviders } from './theme-provider.tsx'
import { googleClientID } from './constants/url.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <Provider store={store}>
          <GoogleOAuthProvider clientId={googleClientID}>
            <ThemeProviders>
              <App />
            </ThemeProviders>
          </GoogleOAuthProvider>
        </Provider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
)
