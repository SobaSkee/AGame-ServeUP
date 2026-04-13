import { Link } from 'react-router-dom'

type Props = {
  title: string
  description?: string
}

export default function PlaceholderScreen({ title, description }: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-white pb-24 font-[Inter,ui-sans-serif,system-ui,sans-serif] text-[#18181b] antialiased md:pb-28">
      <header className="border-b border-[#f3f4f6] bg-white px-6 py-4 md:px-10">
        <h1 className="text-lg font-semibold text-[#111827]">{title}</h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="max-w-sm text-[#71717a]">{description ?? 'Coming soon.'}</p>
        <Link to="/" className="text-sm font-semibold text-[#16a34a] hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  )
}
