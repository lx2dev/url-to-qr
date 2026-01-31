"use client"

import { IconSearch, IconX } from "@tabler/icons-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
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
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState<boolean>(false)

  function handleIconClick() {
    setOpen(true)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 120)
  }

  function handleBlur() {
    if (!value) setOpen(false)
  }

  return (
    <div className="relative flex items-center">
      <button
        aria-label="Open search"
        className={cn(
          "absolute -left-2 z-10 flex size-5 -translate-x-1/2 cursor-pointer items-center justify-center text-muted-foreground transition-opacity duration-150",
          open ? "pointer-events-none opacity-0" : "opacity-100",
        )}
        onClick={handleIconClick}
        tabIndex={open ? -1 : 0}
        type="button"
      >
        <IconSearch className="text-muted-foreground" />
      </button>

      <InputGroup
        className={cn(
          open ? "w-48 opacity-100" : "pointer-events-none w-0 opacity-0",
        )}
      >
        <InputGroupInput
          onBlur={handleBlur}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search..."
          ref={inputRef}
          style={{ minWidth: 0 }}
          type="text"
          value={value}
        />
        <InputGroupAddon>
          <IconSearch className="text-muted-foreground" />
        </InputGroupAddon>
        {value.length > 0 && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Clear search"
              onClick={() => onChange("")}
              size="icon-xs"
            >
              <IconX />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  )
}
