import type { SVGProps } from "react"

export default function ClanLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-cyan-400"
      {...props}
    >
      <circle cx="12" cy="12" r="10" className="fill-gray-900" />
      <path d="M12 2 L12 22 M2 12 L22 12" className="stroke-purple-500" strokeWidth="1" />
      <path d="M12 7 L17 12 L12 17 L7 12 Z" className="fill-cyan-400 stroke-cyan-400" />
      <circle cx="12" cy="12" r="2" className="fill-purple-500" />
    </svg>
  )
}
