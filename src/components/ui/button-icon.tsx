import type { ButtonHTMLAttributes, ReactElement } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type ButtonIconProps = {
  icon: ReactElement
  tooltip: string
  variant?: 'ghost' | 'outline' | 'secondary' | 'default' | 'destructive' | 'success'
  size?: 'icon' | 'sm' | 'default' | 'lg'
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function ButtonIcon({
  icon,
  tooltip,
  variant = 'ghost',
  size = 'icon',
  ...buttonProps
}: ButtonIconProps) {
  const successClass =
    variant === 'success'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
      : ''
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...buttonProps}
          variant={variant === 'success' ? 'secondary' : variant}
          size={size}
          className={cn(successClass, buttonProps.className)}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  )
}
