const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header Hero */}
      <section className="w-full px-6 md:px-20 py-20 flex flex-col md:flex-row items-center justify-between">
        {/* Left Text */}
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            CareConnect –<span className="text-blue-600"> lokale Hilfe</span>
            <br /> schnell & unkompliziert.
          </h1>

          <p className="text-lg text-gray-600">
            Finde Unterstützung in deiner Nähe oder biete selbst Hilfe an –
            freiwillig oder gegen eine kleine Vergütung.
          </p>

          <div className="flex gap-4 mt-6">
            <a
              href="/map"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition"
            >
              Hilfe finden
            </a>

            <a
              href="/create-post"
              className="px-6 py-3 rounded-xl bg-white text-blue-600 border border-blue-600 font-semibold shadow-md hover:bg-blue-50 transition"
            >
              Hilfe anbieten
            </a>
          </div>
        </div>

        {/* Right Mockup */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src="/assets/mockup-home.png"
            alt="CareConnect Mockup"
            className="w-[80%] max-w-md drop-shadow-xl rounded-xl"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 md:px-20 py-16 bg-white">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
          Hauptfunktionen
        </h2>

        <div className="grid md:grid-cols-4 gap-10">
          <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-md transition text-center">
            <img src="/assets/icon-map.png" className="h-14 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Interaktive Karte</h3>
            <p className="text-gray-600 text-sm">
              Hilfsangebote in deiner Nähe finden.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-md transition text-center">
            <img src="/assets/icon-chat.png" className="h-14 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Nachrichten</h3>
            <p className="text-gray-600 text-sm">
              Direkt mit Helfern schreiben.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-md transition text-center">
            <img src="/assets/icon-rating.png" className="h-14 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Bewertungen</h3>
            <p className="text-gray-600 text-sm">
              Vertrauen durch echte Nutzerbewertungen.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-md transition text-center">
            <img src="/assets/icon-sos.png" className="h-14 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">SOS-Modus</h3>
            <p className="text-gray-600 text-sm">
              Sofortige Hilfe über Geoposition.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500">
        © {new Date().getFullYear()} CareConnect – Gemeinschaft verbindet.
      </footer>
    </div>
  );
};

export default Home;
