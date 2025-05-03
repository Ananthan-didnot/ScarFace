import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

interface HeaderProps {
  title?: string;
  userEmail?: string;
  userInitial?: string;
  onLogout?: () => void;
}

export default function Header({ title, userEmail, userInitial, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-red-800 bg-black/90 backdrop-blur-md shadow-[0_4px_20px_0_rgba(255,0,0,0.2)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ScarFace Esports Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
            {title || 'ScarFace'}
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/" className="text-red-500 font-bold">
                Leaderboard
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-red-500 font-bold">
                Admin
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Info (Admin) */}
        {userEmail && userInitial && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
              {userInitial}
            </div>
            <span className="text-white text-sm">{userEmail}</span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded ml-2"
              >
                Logout
              </button>
            )}
          </div>
        )}

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-red-500" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-black border-red-800">
            <SheetTitle className="text-red-500 text-lg font-bold mb-4">Menu</SheetTitle>
            <nav className="flex flex-col gap-4 mt-4">
              <Link href="/" className="text-red-500 font-bold py-2">
                Leaderboard
              </Link>
              <Link href="/admin" className="text-red-500 font-bold py-2">
                Admin
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
