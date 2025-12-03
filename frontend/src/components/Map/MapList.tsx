import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import type { mapcenterProps, OfferProps, RequestProps } from "../../types";
import OrtMap from "./OrtMap";
import { useLanguage } from "../../contexts";

const MapList = ({
  type,
  orts,
}: {
  type: string;
  orts: OfferProps[] | RequestProps[] | null;
}) => {
  const { t } = useLanguage();

  const [currentOrt, setCurrentOrt] = useState<
    OfferProps | RequestProps | null
  >(null);
  const [mapCenter, setMapCenter] = useState<mapcenterProps | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ortLists, setOrtLists] = useState<OfferProps[] | RequestProps[]>(
    orts || []
  );

  useEffect(() => {
    setSearchQuery("");
    setOrtLists(orts || []);
    // default select first item if available
    if (orts && orts.length > 0) {
      setCurrentOrt(orts[0]);
      setMapCenter({
        lat: (orts[0] as any).latitude ?? 0,
        lng: (orts[0] as any).longitude ?? 0,
      });
    } else {
      setCurrentOrt(null);
      setMapCenter(null);
    }
  }, [orts]);

  const handleSearch = (
    e: FormEvent<HTMLFormElement> | ChangeEvent<HTMLInputElement>
  ) => {
    const isSubmit = e.type === "submit";
    if (isSubmit) (e as FormEvent).preventDefault();

    const query = isSubmit
      ? searchQuery
      : (e as ChangeEvent<HTMLInputElement>).target.value;

    if (!isSubmit) setSearchQuery(query);

    if (!query.trim()) {
      setOrtLists(orts || []);
      return;
    }

    if (orts && orts.length > 0) {
      const q = query.toLowerCase();
      const filtered = orts.filter(
        (ort) =>
          (((ort as any).title ?? "") as string)
            .toString()
            .toLowerCase()
            .includes(q) ||
          (((ort as any).location ?? "") as string)
            .toString()
            .toLowerCase()
            .includes(q)
      ) as OfferProps[] | RequestProps[];
      setOrtLists(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setOrtLists(orts || []);
  };

  const showOrt = (ort: OfferProps | RequestProps) => {
    setCurrentOrt(ort);
    const lat = (ort as any).latitude ?? (ort as any).lat ?? 0;
    const lng = (ort as any).longitude ?? (ort as any).lng ?? 0;
    setMapCenter({
      lat,
      lng,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto flex gap-6"></div>

      <div className="modal-box w-11/12 max-w-5xl">
        <div className="card bg-base-100 w-full shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 md:basis-[30%]">
              <h2 className="flex items-center justify-start gap-2 text-xl font-bold mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                {type === "offers"
                  ? t("dashboard.offers")
                  : type === "requests"
                  ? t("dashboard.requests")
                  : t("dashboard.alerts")}
                Events
              </h2>

              <div className="flex items-center gap-2 mb-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="form-control">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Search events..."
                      className="input input-bordered input-sm w-48"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="btn btn-ghost btn-sm"
                        aria-label="Clear search"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    ) : null}

                    <button type="submit" className="btn btn-square btn-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>

              <div className="hidden md:flex flex-col gap-2 carousel carousel-vertical h-108">
                {ortLists &&
                  ortLists.map((ort) => (
                    <div
                      key={(ort as any).id ?? JSON.stringify(ort)}
                      onClick={() => showOrt(ort)}
                      className={`card carousel-item w-full shadow-sm cursor-pointer overflow-hidden hover:shadow-2xl hover:scale-105 transition-transform ${
                        (ort as any).id === (currentOrt as any)?.id
                          ? "bg-primary text-primary-content"
                          : "bg-base-100"
                      }`}
                    >
                      <div className="px-4 py-4">
                        <h2 className="card-title">{(ort as any).title}</h2>
                        <p>📍 {(ort as any).location}</p>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="relative md:hidden">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 px-2">
                  <span className="text-2xl opacity-50">❮</span>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 px-2">
                  <span className="text-2xl opacity-50">❯</span>
                </div>
                <div className="carousel rounded-box w-full">
                  {ortLists &&
                    ortLists.map((ort) => (
                      <div
                        key={(ort as any).id ?? JSON.stringify(ort)}
                        onClick={() => showOrt(ort)}
                        className={`carousel-item w-1/2 card shadow-sm cursor-pointer overflow-hidden transition-transform ${
                          (ort as any).id === (currentOrt as any)?.id
                            ? "bg-primary text-primary-content"
                            : "bg-base-100"
                        }`}
                      >
                        <div className="px-4 py-4 text-sm">
                          <h2 className="card-title text-md">
                            {(ort as any).title}
                          </h2>
                          <p>📍 {(ort as any).location}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex-1 md:basis-[70%]">
              <h2 className="text-2xl font-bold mb-4">
                {(currentOrt as any)?.title ?? "Select an event"}
              </h2>
              {currentOrt ? (
                <>
                  <p className="text-base-content/70 mb-2">
                    📅{" "}
                    {(currentOrt as any).date
                      ? new Date((currentOrt as any).date).toLocaleDateString()
                      : "—"}
                  </p>
                  <p className="text-base-content/70 mb-2">
                    📍 {(currentOrt as any).location}
                  </p>
                  <p className="text-base-content/70 mb-4">
                    📖 {(currentOrt as any).description ?? "—"}
                  </p>
                </>
              ) : (
                <p className="text-base-content/70 mb-4">No event selected</p>
              )}

              {/* Map centered on the event position */}
              {mapCenter && (
                <OrtMap
                  orts={ortLists}
                  mapCenter={mapCenter}
                  onMarkerClick={(o: OfferProps | RequestProps) =>
                    setCurrentOrt(o)
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapList;
