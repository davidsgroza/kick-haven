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
            "Rock",
            "Alt-Rock",
            "Pop-Punk",
            "Punk",
            "Metalcore",
            "Post-Hardcore",
            "Melodic-Hardcore",
            "Glam-Metal",
          ].map((genre) => (
            <div
              key={genre}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700"
            >
              <h3 className="text-xl font-semibold">{genre}</h3>
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
