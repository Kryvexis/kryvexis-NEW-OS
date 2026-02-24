// ✅ Next 15 dynamic params FIX
type Props = {
  params: Promise<{ id: string }>
}

export default async function ClientPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Client Details</h1>
      <p className="opacity-70 text-sm">Client ID: {id}</p>
    </div>
  )
}
