import { useNavigate } from "react-router";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-20 flex min-h-screen items-center justify-center bg-[#1a1b1e] px-6">
      <div className="flex flex-col items-center text-center">
        <svg
          viewBox="0 0 64 64"
          className="mb-6 h-16 w-16 animate-pulse text-[#5865f2]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ animationDuration: "3s" }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 22c0-6.627 6.268-12 14-12h0c7.732 0 14 5.373 14 12v10c0 6.627-6.268 12-14 12h-6l-8 8v-8c-4.418 0-8-3.582-8-8V22c0-6.627 3.582-12 8-12Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M24 28h16" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M24 35h10" />
        </svg>

        <h1 className="text-[120px] font-black leading-none text-[#5865f2]">404</h1>
        <h2 className="mt-3 text-2xl font-bold text-white">Page Not Found</h2>
        <p className="mt-2 text-sm text-[#949ba4]">Looks like you took a wrong turn.</p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 rounded-lg bg-[#5865f2] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#4752c4]"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
