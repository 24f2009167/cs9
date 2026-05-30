import { toast } from 'react-toastify'

// Black toast, gold (login-button) border on success, red border on error.
const base = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: true,
  style: {
    background: '#191c1d',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 500,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
  },
}

export function notifySuccess(message) {
  toast(message, {
    ...base,
    style: { ...base.style, border: '1.5px solid #8c6a40' },
  })
}

export function notifyError(message) {
  toast(message, {
    ...base,
    style: { ...base.style, border: '1.5px solid #dc2626' },
  })
}
