interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: '⚠️',
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: '⚠️',
      confirmBtn: 'bg-manah-bronze hover:bg-manah-gold text-manah-bg',
    },
    info: {
      icon: 'ℹ️',
      confirmBtn: 'bg-manah-gold hover:bg-manah-bronze text-manah-bg',
    },
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-manrope">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity cursor-pointer"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-manah-card rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-manah-gold/30">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-manah-deep rounded-xl mb-4 border border-manah-gold/10">
            <span className="text-4xl">{styles.icon}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-manah-cream text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-manah-muted text-center mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-manah-deep text-manah-cream rounded-xl hover:bg-manah-deep/80 transition font-semibold cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 rounded-xl transition font-semibold cursor-pointer ${styles.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

