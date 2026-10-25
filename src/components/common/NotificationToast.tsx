import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
}

interface NotificationToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-purple-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    warning: 'border-amber-200 bg-amber-50 text-amber-950',
    info: 'border-purple-200 bg-purple-50 text-purple-950',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-slide-up shadow-xl">
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${borders[toast.type]}`}>
        {icons[toast.type]}
        <div className="flex-1 pr-2">
          <h4 className="text-xs font-bold">{toast.title}</h4>
          <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss toast"
          className="p-1 rounded-lg hover:bg-black/5 opacity-70 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
