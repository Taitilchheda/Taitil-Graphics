'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface FilterSection {
  id: string
  title: string
  options: { id: string; label: string; count?: number }[]
}

const filterSections: FilterSection[] = [
  {
    id: 'category',
    title: 'Category',
    options: [
      { id: 'standard', label: 'Standard Cards', count: 45 },
      { id: 'premium', label: 'Premium Cards', count: 23 },
      { id: 'shaped', label: 'Shaped Cards', count: 18 },
      { id: 'digital', label: 'Digital Cards', count: 12 },
      { id: 'specialty', label: 'Specialty Cards', count: 8 }
    ]
  },

  {
    id: 'paper',
    title: 'Paper Type',
    options: [
      { id: 'standard-paper', label: 'Standard Paper', count: 42 },
      { id: 'premium-paper', label: 'Premium Paper', count: 38 },
      { id: 'textured-paper', label: 'Textured Paper', count: 22 },
      { id: 'recycled-paper', label: 'Recycled Paper', count: 15 }
    ]
  },
  {
    id: 'finish',
    title: 'Finish',
    options: [
      { id: 'matte', label: 'Matte', count: 35 },
      { id: 'glossy', label: 'Glossy', count: 28 },
      { id: 'spot-uv', label: 'Spot UV', count: 18 },
      { id: 'foil', label: 'Foil Stamping', count: 12 },
      { id: 'embossed', label: 'Embossed', count: 8 }
    ]
  },
  {
    id: 'features',
    title: 'Special Features',
    options: [
      { id: 'qr-code', label: 'QR Code', count: 15 },
      { id: 'nfc', label: 'NFC Technology', count: 8 },
      { id: 'magnetic', label: 'Magnetic Strip', count: 5 },
      { id: 'transparent', label: 'Transparent', count: 12 },
      { id: 'waterproof', label: 'Waterproof', count: 7 }
    ]
  }
]

export default function ProductFilters() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'paper'])
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const toggleFilter = (sectionId: string, optionId: string) => {
    setSelectedFilters(prev => {
      const sectionFilters = prev[sectionId] || []
      const isSelected = sectionFilters.includes(optionId)
      
      return {
        ...prev,
        [sectionId]: isSelected
          ? sectionFilters.filter(id => id !== optionId)
          : [...sectionFilters, optionId]
      }
    })
  }

  const clearFilter = (sectionId: string, optionId: string) => {
    toggleFilter(sectionId, optionId)
  }

  const clearAllFilters = () => {
    setSelectedFilters({})
  }

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0)
  }

  const getActiveFilters = () => {
    const active: { sectionId: string; optionId: string; label: string }[] = []
    
    Object.entries(selectedFilters).forEach(([sectionId, optionIds]) => {
      const section = filterSections.find(s => s.id === sectionId)
      if (section) {
        optionIds.forEach(optionId => {
          const option = section.options.find(o => o.id === optionId)
          if (option) {
            active.push({ sectionId, optionId, label: option.label })
          }
        })
      }
    })
    
    return active
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Clear All ({getActiveFiltersCount()})
          </button>
        )}
      </div>

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {getActiveFilters().map(({ sectionId, optionId, label }) => (
              <span
                key={`${sectionId}-${optionId}`}
                className="inline-flex items-center bg-teal-100 text-teal-800 text-sm px-3 py-1 rounded-full"
              >
                {label}
                <button
                  onClick={() => clearFilter(sectionId, optionId)}
                  className="ml-2 hover:text-teal-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="space-y-6">
        {filterSections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="text-sm font-medium text-gray-900">{section.title}</h4>
              {expandedSections.includes(section.id) ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {expandedSections.includes(section.id) && (
              <div className="mt-4 space-y-3">
                {section.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters[section.id]?.includes(option.id) || false}
                      onChange={() => toggleFilter(section.id, option.id)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                      {option.label}
                    </span>
                    {option.count && (
                      <span className="text-xs text-gray-500">({option.count})</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>



      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h4>
        <div className="space-y-2">
          <button className="w-full text-left text-sm text-teal-600 hover:text-teal-700 py-1">
            View Most Popular
          </button>
          <button className="w-full text-left text-sm text-teal-600 hover:text-teal-700 py-1">
            Best Value for Money
          </button>
          <button className="w-full text-left text-sm text-teal-600 hover:text-teal-700 py-1">
            Premium Collection
          </button>
        </div>
      </div>
    </div>
  )
}
