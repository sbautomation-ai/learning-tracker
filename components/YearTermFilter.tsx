'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface YearTermFilterProps {
  year: number
  term: 'MID' | 'END'
  onYearChange: (year: number) => void
  onTermChange: (term: 'MID' | 'END') => void
  availableYears?: number[]
}

export function YearTermFilter({
  year,
  term,
  onYearChange,
  onTermChange,
  availableYears = [2024, 2025, 2026],
}: YearTermFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2">
        <Label htmlFor="year-select">Academic Year</Label>
        <Select value={year.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
          <SelectTrigger id="year-select" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Term</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={term === 'MID' ? 'default' : 'outline'}
            onClick={() => onTermChange('MID')}
            className="w-24"
          >
            Mid-Year
          </Button>
          <Button
            type="button"
            variant={term === 'END' ? 'default' : 'outline'}
            onClick={() => onTermChange('END')}
            className="w-24"
          >
            End-Year
          </Button>
        </div>
      </div>
    </div>
  )
}