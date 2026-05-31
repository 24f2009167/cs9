import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'

/**
 * Styled dropdown/select component (Headless UI Listbox).
 *
 * Props:
 *   options  — Array<{ value: string, label: string }>
 *   value    — currently selected value (string)
 *   onChange — (value: string) => void
 *   placeholder — string (default: 'Select an option')
 *   className — optional extra classes for the wrapper
 */
function Select({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  className = '',
}) {
  const selected = options.find(o => o.value === value)

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={`relative ${className}`}>
        {/* Trigger */}
        <ListboxButton
          className={({ open }) =>
            `flex h-11 w-full items-center justify-between rounded-lg border bg-bg-card px-4 text-[13px] transition focus:outline-none ${
              open
                ? 'border-brand ring-1 ring-brand/15'
                : 'border-border focus:border-text-primary focus:ring-1 focus:ring-text-primary'
            } ${selected ? 'text-text-primary' : 'text-text-muted'}`
          }
        >
          {({ open }) => (
            <>
              <span>{selected ? selected.label : placeholder}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                strokeWidth={1.8}
              />
            </>
          )}
        </ListboxButton>

        {/* Dropdown */}
        <ListboxOptions className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border bg-bg-card py-1 shadow-lg focus:outline-none">
          {options.map(opt => (
            <ListboxOption
              key={opt.value}
              value={opt.value}
              className={({ selected: isSel }) =>
                `flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-[13px] transition ${
                  isSel
                    ? 'bg-brand/5 text-brand'
                    : 'text-text-secondary data-[focus]:bg-bg-primary'
                }`
              }
            >
              {({ selected: isSel }) => (
                <>
                  {opt.label}
                  {isSel && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}

export default Select
