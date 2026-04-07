import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">MyFinance by GCITY</h1>
        <p className="text-lg text-gray-600 mb-6">
          Track expenses, income, reimbursements, and monthly trends.
        </p>

        <Link
          href="/login"
          className="inline-block rounded-lg bg-black text-white px-6 py-3"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}
