import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Modal from '../../../components/Modal/Modal'
import Button from '../../../components/Button/Button'
import Input from '../../../components/Input/Input'
import { authLogin } from './service'

function LoginModal({ isOpen, onClose, onLogin }) {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const resetState = () => {
    setError('')
    setIsForgotPassword(false)
    setShowPassword(false)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const data = await authLogin(userId, password)
      onLogin(data.user)
      handleClose()
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid user ID or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = (event) => {
    event.preventDefault()
    setError(`A password reset link has been sent to ${userId || 'your email'}.`)
    setIsForgotPassword(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} position="top-right" title={isForgotPassword ? 'Reset Password' : 'Login'}>
      {isForgotPassword ? (
        <>
          <h2 className="mb-2 font-display text-center text-[15px] font-semibold leading-snug text-text-primary">
            Reset Password
          </h2>
          <p className="mx-auto mb-4 max-w-sm text-center text-[13px] leading-6 text-text-secondary">
            Enter your user ID or email address and we will send password reset instructions.
          </p>

          <form className="flex flex-col gap-3" onSubmit={handleResetPassword}>
            <label className="sr-only" htmlFor="reset-user-id">User ID</label>
            <Input
              autoComplete="username"
              id="reset-user-id"
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter your user ID"
              required
              type="email"
              value={userId}
            />

            <Button type="submit" variant="primary" className="w-full">
              Send Reset Link
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full justify-center"
              onClick={() => {
                setError('')
                setIsForgotPassword(false)
              }}
            >
              Back to Login
            </Button>
          </form>
        </>
      ) : (
        <>
          {error && (
            <p className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-center text-[13px] leading-6 text-danger">
              {error}
            </p>
          )}

          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            <label className="sr-only" htmlFor="login-user-id">User ID</label>
            <Input
              autoComplete="username"
              id="login-user-id"
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter your user ID"
              required
              type="email"
              value={userId}
            />

            <label className="sr-only" htmlFor="login-password">Password</label>
            <div className="relative">
              <Input
                autoComplete="current-password"
                id="login-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                className="pr-12"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.8} /> : <Eye className="h-5 w-5" strokeWidth={1.8} />}
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="self-end text-[13px]"
              onClick={() => {
                setError('')
                setIsForgotPassword(true)
              }}
            >
              Forgot Password?
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="w-full disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </>
      )}
    </Modal>
  )
}

export default LoginModal
