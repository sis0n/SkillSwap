import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
