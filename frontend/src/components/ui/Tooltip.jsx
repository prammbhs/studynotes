import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export function Tooltip({ content, children }) {
  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content sideOffset={8} className="relative z-50">
          <div className="px-3 py-2 text-sm font-medium text-white rounded-lg shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            {content}
          </div>
          <TooltipPrimitive.Arrow className="fill-blue-600" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
