import { Globe2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TimezoneSelectProps {
  value?: string
  onChange: (timezone: string) => void
}

function getTimezones(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      return Intl.supportedValuesOf("timeZone")
    } catch {
    }
  }

  return [
    "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers",
    "Africa/Cairo", "Africa/Casablanca", "Africa/Dar_es_Salaam", "Africa/Douala",
    "Africa/Harare", "Africa/Johannesburg", "Africa/Kinshasa", "Africa/Lagos",
    "Africa/Nairobi", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek",
    "America/Adak", "America/Anchorage", "America/Araguaina", "America/Argentina/Buenos_Aires",
    "America/Asuncion", "America/Atikokan", "America/Bahia", "America/Belize",
    "America/Bogota", "America/Caracas", "America/Cayenne", "America/Chicago",
    "America/Chihuahua", "America/Costa_Rica", "America/Cuiaba", "America/Danmarkshavn",
    "America/Dawson_Creek", "America/Denver", "America/Detroit", "America/Edmonton",
    "America/El_Salvador", "America/Fortaleza", "America/Glace_Bay", "America/Godthab",
    "America/Guatemala", "America/Halifax", "America/Havana", "America/Hermosillo",
    "America/Indiana/Indianapolis", "America/Juneau", "America/Knox_IN", "America/La_Paz",
    "America/Lima", "America/Los_Angeles", "America/Maceio", "America/Managua",
    "America/Manaus", "America/Martinique", "America/Matamoros", "America/Mazatlan",
    "America/Merida", "America/Mexico_City", "America/Monterrey", "America/Montevideo",
    "America/Nassau", "America/New_York", "America/Noronha", "America/Ojinaga",
    "America/Panama", "America/Paramaribo", "America/Phoenix", "America/Port-au-Prince",
    "America/Porto_Velho", "America/Puerto_Rico", "America/Recife", "America/Regina",
    "America/Rio_Branco", "America/Santiago", "America/Santo_Domingo", "America/Sao_Paulo",
    "America/Scoresbysund", "America/Sitka", "America/St_Johns", "America/Tegucigalpa",
    "America/Thule", "America/Tijuana", "America/Toronto", "America/Vancouver",
    "America/Whitehorse", "America/Winnipeg", "America/Yakutat", "America/Yellowknife",
    "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Mawson",
    "Antarctica/McMurdo", "Antarctica/Palmer", "Antarctica/Rothera", "Antarctica/Syowa",
    "Antarctica/Troll", "Antarctica/Vostok", "Arctic/Longyearbyen", "Asia/Aden",
    "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Aqtau", "Asia/Aqtobe",
    "Asia/Ashgabat", "Asia/Atyrau", "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku",
    "Asia/Bangkok", "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei",
    "Asia/Chita", "Asia/Colombo", "Asia/Damascus", "Asia/Dhaka", "Asia/Dili",
    "Asia/Dubai", "Asia/Dushanbe", "Asia/Famagusta", "Asia/Gaza", "Asia/Hebron",
    "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Hovd", "Asia/Irkutsk",
    "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem", "Asia/Kabul", "Asia/Kamchatka",
    "Asia/Karachi", "Asia/Kathmandu", "Asia/Khandyga", "Asia/Kolkata", "Asia/Krasnoyarsk",
    "Asia/Kuala_Lumpur", "Asia/Kuching", "Asia/Kuwait", "Asia/Macau", "Asia/Magadan",
    "Asia/Makassar", "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Novokuznetsk",
    "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral", "Asia/Phnom_Penh", "Asia/Pontianak",
    "Asia/Pyongyang", "Asia/Qatar", "Asia/Qostanay", "Asia/Qyzylorda", "Asia/Riyadh",
    "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore",
    "Asia/Srednekolymsk", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran",
    "Asia/Thimphu", "Asia/Tokyo", "Asia/Tomsk", "Asia/Ulaanbaatar", "Asia/Urumqi",
    "Asia/Ust-Nera", "Asia/Vladivostok", "Asia/Yakutsk", "Asia/Yangon",
    "Asia/Yekaterinburg", "Asia/Yerevan", "Atlantic/Azores", "Atlantic/Bermuda",
    "Atlantic/Canary", "Atlantic/Cape_Verde", "Atlantic/Faroe", "Atlantic/Madeira",
    "Atlantic/Reykjavik", "Atlantic/South_Georgia", "Atlantic/Stanley",
    "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken_Hill",
    "Australia/Darwin", "Australia/Eucla", "Australia/Hobart", "Australia/Lindeman",
    "Australia/Lord_Howe", "Australia/Melbourne", "Australia/Perth", "Australia/Sydney",
    "Europe/Amsterdam", "Europe/Andorra", "Europe/Astrakhan", "Europe/Athens",
    "Europe/Belgrade", "Europe/Berlin", "Europe/Brussels", "Europe/Bucharest",
    "Europe/Budapest", "Europe/Chisinau", "Europe/Copenhagen", "Europe/Dublin",
    "Europe/Gibraltar", "Europe/Helsinki", "Europe/Istanbul", "Europe/Kaliningrad",
    "Europe/Kiev", "Europe/Kirov", "Europe/Lisbon", "Europe/Ljubljana",
    "Europe/London", "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta",
    "Europe/Minsk", "Europe/Monaco", "Europe/Moscow", "Europe/Oslo", "Europe/Paris",
    "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Samara", "Europe/Saratov",
    "Europe/Simferopol", "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn",
    "Europe/Tirane", "Europe/Ulyanovsk", "Europe/Uzhgorod", "Europe/Vienna",
    "Europe/Vilnius", "Europe/Volgograd", "Europe/Warsaw", "Europe/Zaporozhye",
    "Europe/Zurich", "Indian/Chagos", "Indian/Maldives", "Indian/Mauritius",
    "Pacific/Apia", "Pacific/Auckland", "Pacific/Bougainville", "Pacific/Chatham",
    "Pacific/Efate", "Pacific/Enderbury", "Pacific/Fakaofo", "Pacific/Fiji",
    "Pacific/Funafuti", "Pacific/Galapagos", "Pacific/Gambier", "Pacific/Guadalcanal",
    "Pacific/Guam", "Pacific/Honolulu", "Pacific/Kiritimati", "Pacific/Kosrae",
    "Pacific/Kwajalein", "Pacific/Majuro", "Pacific/Marquesas", "Pacific/Nauru",
    "Pacific/Niue", "Pacific/Norfolk", "Pacific/Noumea", "Pacific/Pago_Pago",
    "Pacific/Palau", "Pacific/Pitcairn", "Pacific/Pohnpei", "Pacific/Port_Moresby",
    "Pacific/Rarotonga", "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa",
    "Pacific/Tongatapu", "Pacific/Wake", "Pacific/Wallis",
    "UTC",
  ]
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  const [detected, setDetected] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const allTimezones = useMemo(() => getTimezones(), [])

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setDetected(tz)
    } catch {
      setDetected(null)
    }
  }, [])

  const filtered = useMemo(() => {
    const list: { label: string; value: string }[] = []
    if (!query) {
      list.push({ label: detected ? `Auto-detected (${detected})` : "Clear timezone", value: "" })
    }
    const matches = allTimezones
      .filter((tz) => !query || tz.toLowerCase().includes(query.toLowerCase()))
      .map((tz) => ({ label: tz.replace(/_/g, " "), value: tz }))
    list.push(...matches)
    return list
  }, [allTimezones, detected, query])

  function selectTimezone(entry: { value: string }) {
    onChange(entry.value)
    setQuery("")
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true)
        setActiveIndex(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          selectTimezone(filtered[activeIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [activeIndex])

  return (
    <div className="space-y-2">
      <Label htmlFor="timezone">Timezone</Label>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Globe2 className="size-4 text-muted-foreground" />
        </div>
        <Input
          id="timezone"
          ref={inputRef}
          type="text"
          placeholder={detected ? `Auto-detected (${detected})` : "Search timezone..."}
          value={value && !open ? value.replace(/_/g, " ") : query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => {
            setOpen(true)
            setQuery("")
          }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="pl-9"
        />

        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-popover shadow-md">
            {filtered.length > 0 ? (
              filtered.map((entry, i) => (
                <button
                  key={entry.value}
                  type="button"
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-sm transition-colors",
                    !entry.value
                      ? "text-muted-foreground italic"
                      : entry.value === value
                        ? "bg-primary text-primary-foreground"
                        : i === activeIndex
                          ? "bg-accent text-accent-foreground"
                          : "text-popover-foreground hover:bg-accent",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectTimezone(entry)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  {entry.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No timezones found.</div>
            )}
          </div>
        )}
      </div>

      {detected && !value && !open && (
        <p className="text-xs text-muted-foreground">
          Auto-detected as {detected}. Type to override.
        </p>
      )}
    </div>
  )
}
