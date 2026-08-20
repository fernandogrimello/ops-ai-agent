import React from "react"

const priorityColor: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-400/10",
  HIGH: "text-orange-400 bg-orange-400/10",
  MEDIUM: "text-yellow-400 bg-yellow-400/10",
  LOW: "text-green-400 bg-green-400/10",
}

interface PriorityBadgeProps {
  priority: string
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${priorityColor[priority] || "text-gray-400 bg-gray-400/10"}`}>
      {priority}
    </span>
  )
}
