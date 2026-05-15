/* eslint-disable @next/next/no-page-custom-font */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
