import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function Dialog({ open, onOpenChange, title, children }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xl rounded-2xl border border-white/20 bg-white dark:bg-gray-900 shadow-2xl">
          <div className="relative p-6">
            <DialogPrimitive.Title className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </DialogPrimitive.Title>
            <div className="mt-4 text-gray-700 dark:text-gray-300">
              {children}
            </div>
            <DialogPrimitive.Close asChild>
              <button className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
                <X size={18} />
              </button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
