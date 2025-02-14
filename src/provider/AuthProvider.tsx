import { createContext, useContext, useState, useEffect } from 'react'
import { Session, SupabaseClient, User } from '@supabase/supabase-js'

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ 
  supabase, 
  children 
}: { 
  supabase: SupabaseClient;
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const value = {
    session,
    user,
    loading,
    signInWithGoogle: async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({ 
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}`
          }
        })
        return { error }
      } catch (error) {
        return { error: error as Error }
      }
    },
    signInWithGithub: async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({ 
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}`
          }
        })
        return { error }
      } catch (error) {
        return { error: error as Error }
      }
    },
    signOut: async () => {
      await supabase.auth.signOut()
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
