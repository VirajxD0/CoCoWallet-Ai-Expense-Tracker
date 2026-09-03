import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Min 8 chars').regex(/[A-Z]/, 'Uppercase required').regex(/[a-z]/, 'Lowercase required').regex(/[0-9]/, 'Number required'),
})
type Form = z.infer<typeof schema>

export default function Signup() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s=>s.setAuth)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState:{ errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })
  const onSubmit = async (data: Form) => {
    setError('')
    try {
      const res = await authApi.signup(data)
      const { user, tokens } = res.data.data
      setAuth(user, tokens.accessToken, tokens.refreshToken)
      navigate('/dashboard')
    } catch (e:any) { setError(e.response?.data?.message || e.response?.data?.errors?.[0]?.message || 'Signup failed') }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">₿</div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Start tracking with AI insights</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
            <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" placeholder="Ada Lovelace" {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" {...register('email')} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="••••••••" {...register('password')} />{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}<p className="text-xs text-muted-foreground">8+ chars, upper, lower, number</p></div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create account'}</Button>
            <p className="text-center text-sm text-muted-foreground">Already have account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
