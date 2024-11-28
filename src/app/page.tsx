import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-gray-900 text-white min-h-screen p-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold">Welcome to kickHaven</h1>
        <p className="text-lg mt-4">
          Explore and discuss all your favorite alternative music genres!
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Popular Genres</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { genre: "Rock", categoryId: "60d23d8f5c5f2c001c9a59f0" },
            { genre: "Alt-Rock", categoryId: "60d23d8f5c5f2c001c9a59f1" },
            { genre: "Pop-Punk", categoryId: "60d23d8f5c5f2c001c9a59f2" },
            { genre: "Punk", categoryId: "60d23d8f5c5f2c001c9a59f3" },
            { genre: "Hardcore", categoryId: "60d23d8f5c5f2c001c9a59f4" },
            { genre: "Post-Hardcore", categoryId: "60d23d8f5c5f2c001c9a59f5" },
            { genre: "Metalcore", categoryId: "60d23d8f5c5f2c001c9a59f6" },
            { genre: "Glam-Metal", categoryId: "60d23d8f5c5f2c001c9a59f7" },
          ].map(({ genre, categoryId }) => (
            <div
              key={categoryId}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700"
            >
              <Link
                href={`/category/${categoryId}`}
                className="text-xl font-semibold"
              >
                {genre}
              </Link>
              <p className="mt-2 text-sm">
                Dive into discussions about {genre} music.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
