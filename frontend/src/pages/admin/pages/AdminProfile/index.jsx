import { useEffect, useState } from 'react'
import { Camera, Save, Lock, Mail, User, Shield, Loader } from 'lucide-react'
import { fetchProfile, updateProfile, changePassword } from '../../../user/service'
import useAuthStore from '../../../../store/useAuthStore'
import { notifySuccess, notifyError } from '../../../../lib/notify'
import Button from '../../../../components/Button/Button'

function AdminProfileView({ user }) {
  const setUser = useAuthStore(s => s.setUser)

  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
      .then(p => setName(p.displayName || user?.name || ''))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!name.trim()) {
      notifyError('Name cannot be empty.')
      return
    }
    const wantsPasswordChange = currentPassword || newPassword
    if (wantsPasswordChange && (!currentPassword || !newPassword)) {
      notifyError('Enter both your current and new password.')
      return
    }

    setSaving(true)
    try {
      await updateProfile({ displayName: name.trim() })
      const fresh = await fetchProfile()
      const current = useAuthStore.getState().user
      setUser({ ...current, name: fresh.displayName || current?.name || name })

      if (wantsPasswordChange) {
        await changePassword(currentPassword, newPassword)
        setCurrentPassword('')
        setNewPassword('')
      }

      notifySuccess(
        wantsPasswordChange
          ? 'Profile and password updated successfully.'
          : 'Profile updated successfully.',
      )
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AD'

  const inputBase =
    'h-11 w-full rounded-lg border border-border bg-bg-tertiary pl-10 pr-3 text-[13px] text-text-primary outline-none transition placeholder:text-text-muted focus:border-brand focus:bg-bg-card focus:ring-2 focus:ring-brand/15'

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-8">
      <div className="mx-auto max-w-[800px]">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display text-[22px] font-semibold text-text-primary">
            Profile Settings
          </h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Manage your account preferences, security, and personal information.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border-light bg-bg-card p-8 shadow-sm">
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-[13px] text-text-muted">
              <Loader className="h-4 w-4 animate-spin" /> Loading profile…
            </div>
          ) : (
            <>
              {/* Photo */}
              <div className="mb-8 flex items-center gap-6">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0b1528] to-[#1e3a8a] text-[26px] font-bold text-white shadow-md">
                    {initials}
                  </div>
                  <button
                    type="button"
                    title="Upload new photo"
                    onClick={() => notifyError('Photo upload is not supported.')}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#191c1d] text-white transition hover:scale-110 hover:bg-brand"
                  >
                    <Camera className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </button>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">Profile Photo</h3>
                  <p className="text-[12px] text-text-muted">
                    Update your dashboard avatar. Recommended size: 256×256px.
                  </p>
                </div>
              </div>

              {/* Name + email */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label className="mb-2 text-[12px] font-semibold text-text-secondary">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 h-4 w-4 text-text-muted" strokeWidth={1.8} />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className={inputBase}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 flex items-center justify-between text-[12px] font-semibold text-text-secondary">
                    Email Address
                    <span className="rounded bg-danger/10 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-danger">
                      READ-ONLY
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 h-4 w-4 text-text-muted" strokeWidth={1.8} />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="h-11 w-full cursor-not-allowed rounded-lg border border-border-light bg-bg-primary pl-10 pr-3 text-[13px] text-text-muted"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-text-muted">
                    Your email is tied to your institutional ID and cannot be changed.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="my-8 h-px bg-bg-tertiary" />

              {/* Password & Security */}
              <div className="mb-6 flex items-center gap-2 text-[14px] font-bold text-text-primary">
                <Shield className="h-[18px] w-[18px]" strokeWidth={1.8} />
                Password &amp; Security
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label className="mb-2 text-[12px] font-semibold text-text-secondary">Current Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 h-4 w-4 text-text-muted" strokeWidth={1.8} />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className={inputBase}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-[12px] font-semibold text-text-secondary">New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 h-4 w-4 text-text-muted" strokeWidth={1.8} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex items-center justify-end gap-4">
                <Button
                  variant="secondary"
                  className="h-11 px-6 text-[13px]"
                  onClick={() => {
                    setName(user?.name || '')
                    setCurrentPassword('')
                    setNewPassword('')
                  }}
                >
                  Discard
                </Button>
                <Button
                  className="gap-2 px-6 text-[13px]"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <Loader className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                    : <Save className="h-4 w-4" strokeWidth={1.8} />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProfileView