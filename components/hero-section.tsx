export default function HeroSection() {
  return (
    <section className="py-12 text-center">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-red-600 drop-shadow-[0_2px_16px_rgba(255,0,0,0.7)] font-extrabold">
          ScarFace
        </span>
        <br />
        <span className="text-white">Leaderboard</span>
      </h1>
      <p className="mx-auto max-w-2xl text-gray-400">
        Track the performance of our elite players across all tournaments and games. Rise through the ranks and claim
        your place among the gods.
      </p>
      <div className="mt-8 h-1 w-24 mx-auto bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
    </section>
  )
}
