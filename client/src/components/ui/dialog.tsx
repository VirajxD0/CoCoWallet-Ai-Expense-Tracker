import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
interface DialogProps { open: boolean; onOpenChange: (o: boolean)=>void; children: React.ReactNode }
export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-auto">{children}</div>
    </div>
  )
}
export function DialogContent({ className, children, onClose }: { className?:string; children:React.ReactNode; onClose?:()=>void }) {
  return <div className={cn("relative bg-background border rounded-lg shadow-lg p-6 m-4", className)}>
    {onClose && <button onClick={onClose} className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><X className="h-4 w-4"/></button>}
    {children}
  </div>
}
export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)} {...props} /> }
export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} /> }
export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("text-sm text-muted-foreground", className)} {...props} /> }
