import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-[#0e4d28]">Page not found</h1>
      <p className="mt-3 text-[#3e4c45]">That page is not part of this demonstration.</p>
      <Link href="/" className="mt-5 inline-flex min-h-11 items-center font-semibold text-[#0e4d28]">
        Back to the home page
      </Link>
    </div>
  );
}
