"use client"

import { SupabaseChatDashboard } from "@/components/supabase-chat-dashboard"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SupabaseChatDashboard />
    </Suspense>
  )
}
