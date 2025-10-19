import { useEffect, useState, useMemo } from "react";
import { SalonAPI } from "./salon.api";
import Card from "../../components/ui/Card";

const DAY_LABELS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export default function SalonDetails() {
  const [data, setData] = useState(null);
  useEffect(() => {
    SalonAPI.get()
      .then(setData)
      .catch(() => setData(null));
  }, []);
  const mapUrl = useMemo(
    () =>
      data?.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            data.address
          )}`
        : null,
    [data]
  );

  return (
    <div className="pb-10">
      {/* Hero */}
      {data?.heroUrl ? (
        <div
          className="w-full h-56 md:h-72 bg-gray-100"
          style={{
            backgroundImage: `url(${data.heroUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : (
        <div className="w-full h-16" />
      )}

      <div className="max-w-6xl mx-auto px-4 -mt-8 space-y-6">
        <div className="bg-white rounded-2xl border p-5">
          <h1 className="text-2xl font-semibold">{data?.name || "Salon"}</h1>
          {data?.about && <p className="text-gray-700 mt-2">{data.about}</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Contact */}
          <Card className="p-5">
            <div className="font-semibold mb-3">Contact</div>
            {data?.address && (
              <div className="mb-2">
                <div className="text-sm text-gray-600">Address</div>
                <div>{data.address}</div>
              </div>
            )}
            {data?.phone && (
              <div className="mb-2">
                <div className="text-sm text-gray-600">Phone</div>
                <a
                  className="text-blue-600 underline"
                  href={`tel:${data.phone}`}
                >
                  {data.phone}
                </a>
              </div>
            )}
            {data?.email && (
              <div className="mb-2">
                <div className="text-sm text-gray-600">Email</div>
                <a
                  className="text-blue-600 underline"
                  href={`mailto:${data.email}`}
                >
                  {data.email}
                </a>
              </div>
            )}
            {mapUrl && (
              <a
                className="text-blue-600 underline"
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open in Maps
              </a>
            )}
          </Card>

          {/* Opening hours */}
          <Card className="p-5 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-brand-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7v5l3 2"
                />
              </svg>
              <div className="font-semibold text-lg">Opening Hours</div>
            </div>
            <div className="space-y-2">
              {Object.entries(DAY_LABELS).map(([key, label]) => {
                const h = data?.hours?.[key];
                const isToday =
                  new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                  }) === label;
                const isOpen = h?.open;

                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                      isToday
                        ? "bg-brand-50 border border-brand-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`font-medium ${
                          isToday ? "text-brand-700" : "text-gray-700"
                        }`}
                      >
                        {label}
                      </div>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-brand-600 text-white text-[10px] font-semibold rounded-full uppercase">
                          Today
                        </span>
                      )}
                    </div>
                    <div
                      className={`font-medium flex items-center gap-1.5 ${
                        isOpen
                          ? isToday
                            ? "text-brand-700"
                            : "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {isOpen ? (
                        <>
                          <svg
                            className="w-4 h-4 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            {h.start} – {h.end}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Closed</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
