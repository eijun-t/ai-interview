export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      {children}
    </div>
  )
}