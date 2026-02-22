
import '@/styles/globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Layout from '@/components/Layout'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  
  // Don't show Layout on login page
  const showLayout = router.pathname !== '/login' && router.pathname !== '/'
  
  return (
    <AuthProvider>
      {showLayout ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </AuthProvider>
  )
}

