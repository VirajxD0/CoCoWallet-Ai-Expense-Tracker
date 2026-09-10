import logo from '@/assets/icons/CoCoWalletLogo-512.png'

type Props = {
  size?: number
  showText?: boolean
  variant?: 'default' | 'light' | 'iconOnly'
  className?: string
  textClassName?: string
}

export function Logo({ size = 40, showText = true, variant = 'default', className = '', textClassName = '' }: Props) {
  const isLight = variant === 'light'
  if (variant === 'iconOnly') {
    return (
      <img
        src={logo}
        alt="CoCoWallet"
        width={size}
        height={size}
        className={`object-contain shrink-0 ${className}`}
        style={{ width: size, height: size }}
        draggable={false}
      />
    )
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logo}
        alt="CoCoWallet logo"
        width={size}
        height={size}
        className="object-contain shrink-0 rounded-full shadow-premium ring-1 ring-black/5"
        style={{ width: size, height: size }}
        draggable={false}
      />
      {showText && (
        <span className={`flex flex-col leading-none ${textClassName}`}>
          <span
            className={`font-display font-extrabold tracking-tight ${isLight ? 'text-white' : 'text-foreground'}`}
            style={{ fontSize: size * 0.52, lineHeight: 1 }}
          >
            CoCoWallet
          </span>
          <span
            className={`font-sans font-semibold tracking-[0.14em] uppercase ${isLight ? 'text-white/70' : 'text-muted-foreground'}`}
            style={{ fontSize: size * 0.18, marginTop: 1 }}
          >
            AI Expense Tracker
          </span>
        </span>
      )}
    </span>
  )
}

export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src={logo}
      alt="CoCoWallet"
      width={size}
      height={size}
      className={`object-contain rounded-full shadow-premium ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  )
}

export default Logo
