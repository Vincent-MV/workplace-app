import { createClient } from '@/lib/supabase/server' // Adjust this import to match your actual supabase client path
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully logged in! Redirect to onboarding or dashboard
      return NextResponse.redirect(`${origin}/onboarding`) 
    }
  }
  
  // If there's an error, redirect to an error page or login
  return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}