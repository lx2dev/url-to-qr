"use client"

import { IconSearch, IconX } from "@tabler/icons-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

interface QRCodeSearchProps {
  value: string
  onChange: (value: string) => void
}

export function QRCodeSearch({ value, onChange }: QRCodeSearchProps) {
  return (
    <InputGroup>
      <InputGroupInput
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        style={{ minWidth: 0 }}
        type="text"
        value={value}
      />
      <InputGroupAddon>
        <IconSearch className="text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupAddon
        align="inline-end"
        className={cn(value.length > 0 ? "opacity-100" : "opacity-0")}
      >
        <InputGroupButton
          aria-label="Clear search"
          onClick={() => onChange("")}
          size="icon-xs"
        >
          <IconX />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
