'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabaseClient'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Hasła nie są takie same')
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-cyan-600 mb-4">Create Your Account</h1>
        <p className="text-center text-sm text-gray-700 mb-6">
          Join Keeper to start preserving your own legacy, to become the Keeper administrator of an existing memorial, and much more!
        </p>
        <hr className="border-t-2 border-cyan-400 mb-6" />
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your First Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Your First Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Last Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Your Last Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Email Address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Re-enter Password <span className="text-red-500">*</span>
            </label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Re-enter Password" />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded shadow">
            <span className="inline-block align-middle">❤️</span> Create Account
          </button>
        </form>

        <p className="text-xs text-center text-gray-600 mt-4">
          By clicking create an account you agree to the <a href="#" className="text-cyan-600 underline">Terms and Conditions</a> and confirm that you are above the age of 13
        </p>
        <p className="text-sm text-center mt-2">
          Already have an account? <a href="/auth/login" className="text-cyan-600 font-medium">Log in</a>
        </p>
      </div>
    </div>
  )
}
