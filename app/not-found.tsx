import "./globals.css";

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <main className="wrap flex min-h-screen flex-col items-center justify-center py-20 text-center">
          <img src="/brand/logo.png" alt="The Deenway School" width={515} height={170} className="h-14 w-auto" />
          <h1 className="mt-10 text-4xl font-semibold">Page not found</h1>
          <p className="mt-3 text-muted">The page you were looking for has moved or no longer exists.</p>
          <a href="/" className="btn btn-primary mt-8">Go to the homepage</a>
        </main>
      </body>
    </html>
  );
}
