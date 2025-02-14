export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-4">
            We are dedicated to making software design and development more accessible and efficient.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p className="mb-4">
            To provide developers with powerful tools for visualizing and creating software architecture.
          </p>
          {/* Add more content as needed */}
        </div>
      </div>
    </div>
  )
}
