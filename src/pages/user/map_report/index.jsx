import { Link } from "react-router-dom";

export default function MapReportPage() {

  const DocIcon = () => (
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 8v4l3 3"
      />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-gray-800">

      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex items-center text-gray-600 shrink-0">

        <Link to="/dashboard">
          <button className="flex items-center hover:text-black transition font-medium text-sm sm:text-base">

            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>

            Back
          </button>
        </Link>
      </header>

      {/* ANALYTICS */}
      <div className="px-4 sm:px-6 py-5 sm:py-6 border-b border-gray-200 shrink-0">

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 max-w-7xl mx-auto w-full">

          {/* CARD 1 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 h-36 flex items-center justify-center relative overflow-hidden shadow-sm">

            {/* AXIS */}
            <div className="absolute left-4 top-4 bottom-4 w-px bg-black flex flex-col justify-between items-center">
              <div className="w-2 h-px bg-black -mt-px relative">
                <div className="absolute -top-1 -left-1 border-b-4 border-r-4 border-transparent border-b-black transform -rotate-45"></div>
              </div>
            </div>

            <div className="absolute left-4 bottom-4 right-4 h-px bg-black flex justify-end items-center">
              <div className="w-px h-2 bg-black -mr-px relative">
                <div className="absolute -top-1 -right-1 border-t-4 border-l-4 border-transparent border-l-black transform rotate-45"></div>
              </div>
            </div>

            {/* GRAPH */}
            <div className="absolute inset-0 pl-4 pb-4 opacity-80">

              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient
                    id="greenGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#4ade80"
                      stopOpacity="0.8"
                    />

                    <stop
                      offset="100%"
                      stopColor="#ffffff"
                      stopOpacity="0.1"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M0,80 C15,60 25,50 40,55 C55,60 70,20 85,15 C95,12 100,20 100,30 L100,100 L0,100 Z"
                  fill="url(#greenGradient)"
                  stroke="#22c55e"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 h-36 flex flex-col justify-center shadow-sm">

            <h3 className="text-sm font-bold text-black mb-3">
              Resolved Problem Monthly
            </h3>

            {/* LEGEND */}
            <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 mb-3">

              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                Resolved
              </span>

              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                Total
              </span>
            </div>

            {/* BARS */}
            <div className="space-y-2">

              {[
                { month: "Jan", total: "100%", resolved: "65%" },
                { month: "Feb", total: "60%", resolved: "50%" },
                { month: "Mar", total: "80%", resolved: "60%" },
              ].map((item) => (
                <div
                  key={item.month}
                  className="flex items-center gap-3 text-xs text-gray-400"
                >
                  <span className="w-6">
                    {item.month}
                  </span>

                  <div
                    className="flex-1 h-3.5 bg-gray-200 rounded-sm relative"
                    style={{ width: item.total }}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-[#4ca64c] rounded-sm"
                      style={{ width: item.resolved }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 3 */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between h-36 shadow-sm">

            <div className="w-8 h-8 border border-gray-200 rounded-md flex items-center justify-center mb-2">
              <DocIcon />
            </div>

            <div>
              <p className="text-gray-600 text-[13px] mb-1">
                Total Complaints ( Monthly )
              </p>

              <div className="flex justify-between items-end gap-2">

                <h3 className="text-2xl font-bold text-black">
                  258
                </h3>

                <span className="border border-black rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium flex items-center gap-1 whitespace-nowrap">
                  ↑ 20% More
                </span>
              </div>
            </div>
          </div>

          {/* CARD 4 */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between h-36 shadow-sm">

            <div className="w-8 h-8 border border-gray-200 rounded-md flex items-center justify-center mb-2">
              <DocIcon />
            </div>

            <div>
              <p className="text-gray-600 text-[13px] mb-1 leading-tight">
                Total Resolved Complaints
                <br />
                ( Monthly )
              </p>

              <div className="flex justify-between items-end gap-2">

                <h3 className="text-2xl font-bold text-black">
                  258
                </h3>

                <span className="border border-black rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium flex items-center gap-1 whitespace-nowrap">
                  ↑ 20% More
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAP AREA */}
      <div className="relative w-full bg-gray-200 h-[65vh] sm:h-[70vh] lg:flex-1 lg:min-h-0">

        {/* FILTER BUTTON */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-8 z-10 bg-white border border-gray-300 rounded shadow-sm px-3 sm:px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition text-xs sm:text-sm font-semibold">

          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>

          <span>Maret</span>

          <svg
            className="w-4 h-4 text-gray-500 sm:ml-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* MAP */}
        <iframe
          src="https://maps.google.com/maps?q=Batam%20Centre&t=&z=14&ie=UTF8&iwloc=&output=embed"
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>

      </div>
    </div>
  );
}