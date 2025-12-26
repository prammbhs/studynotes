import * as Toast from '@radix-ui/react-toast';

const GRADIENTS = {
  blue: 'from-blue-600 via-purple-600 to-pink-600',
  green: 'from-emerald-600 via-green-600 to-teal-600',
  orange: 'from-orange-600 via-red-600 to-pink-600',
};

export function AppToast({ open, onOpenChange, title, description, variant = 'blue' }) {
  const gradient = GRADIENTS[variant] || GRADIENTS.blue;
  return (
    <Toast.Root
      open={open}
      onOpenChange={onOpenChange}
      className={`group relative rounded-xl p-4 text-white shadow-2xl backdrop-blur-sm overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-90`}></div>
      <div className="relative z-10 flex items-start gap-3">
        <div className="mt-0.5 text-2xl">🎉</div>
        <div className="space-y-1">
          {title && <Toast.Title className="font-bold text-lg">{title}</Toast.Title>}
          {description && (
            <Toast.Description className="text-sm text-white/90">
              {description}
            </Toast.Description>
          )}
        </div>
      </div>
      <Toast.Close className="absolute right-3 top-3 text-white/90 hover:text-white transition">✕</Toast.Close>
    </Toast.Root>
  );
}

export function ToastViewport() {
  return (
    <Toast.Viewport
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-[360px] max-w-[calc(100%-2rem)] outline-none"
    />
  );
}

export const ToastProvider = Toast.Provider;
