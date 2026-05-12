import Link from 'next/link';

export const metadata = {
  title: 'Access Restricted – Blue Harbor',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Access Restricted</h1>
        <p className="mt-3 text-gray-600">
          Your account is not authorized to access the Blue Harbor dashboard.
          Only registered team members can use this area.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          If you believe this is a mistake, contact your team administrator to
          be added to the team roster.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
