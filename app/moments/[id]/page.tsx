import { MomentPlayer } from "@/components/moments/MomentPlayer";

export default async function MomentViewPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-surface font-be-vietnam-pro" suppressHydrationWarning>
      <MomentPlayer momentId={id} />
    </div>
  );
}
