import toast from 'react-hot-toast';

export const toastConfig = {
  position: 'top-right',
  toastOptions: {
    duration: 4000,
    style: {
      background: '#151c2c',
      color: '#f1f5f9',
      border: '1px solid #1e293b',
      borderRadius: '10px',
      padding: '12px 16px',
      fontSize: '14px',
      fontFamily: "'Inter', sans-serif",
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(12px)',
    },
    success: {
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
      style: {
        borderLeft: '3px solid #10b981',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
      style: {
        borderLeft: '3px solid #ef4444',
      },
      duration: 5000,
    },
    loading: {
      style: {
        borderLeft: '3px solid #3b82f6',
      },
    },
  },
};

export const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  loading: (message) => toast.loading(message),
  dismiss: (toastId) => toast.dismiss(toastId),
  promise: (promise, messages) => toast.promise(promise, messages),
};

export default showToast;
