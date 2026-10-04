import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { CategoryWithCount } from '../lib/catalog'

type Props = {
  items: CategoryWithCount[]
  label?: string
  activeName?: string
  variant?: 'header' | 'filter'
  onSelect: (name: string) => void
}

/*
  Menu retrátil com as categorias que não cabem
  na lista principal (cabeçalho ou vitrine).
*/
export default function CategoryDropdown({
  items,
  label = 'Mais categorias',
  activeName,
  variant = 'header',
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const activeItem = items.find((item) => item.name === activeName)

  useEffect(() => {
    if (!open) return

    function handleClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!items.length) return null

  const buttonClass = [
    variant === 'filter' ? 'filter' : 'category-dropdown-toggle',
    'category-dropdown-button',
    activeItem ? 'active' : '',
    open ? 'open' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={`category-dropdown category-dropdown-${variant}`} ref={wrapperRef}>
      <button
        type="button"
        className={buttonClass}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        {activeItem ? activeItem.name : label}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="category-dropdown-menu" id={menuId}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.name === activeName ? 'active' : ''}
              onClick={() => {
                onSelect(item.name)
                setOpen(false)
              }}
            >
              <span>{item.name}</span>
              <small>{item.productCount}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
