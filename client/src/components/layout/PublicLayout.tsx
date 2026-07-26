import { Heart } from "lucide-react"
import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="flex items-center justify-center gap-1 border-t px-4 py-3 text-xs text-muted-foreground">
        made from <Heart className="size-3 fill-current text-red-500" />
      </footer>
    </div>
  )
}
