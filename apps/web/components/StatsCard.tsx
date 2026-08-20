import React from "react"

interface StatsCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}

export function StatsCard({ icon, label, value, color }: StatsCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
