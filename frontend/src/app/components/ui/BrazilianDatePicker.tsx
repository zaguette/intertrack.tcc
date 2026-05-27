import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type BrazilianDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDisplayDate(value: string) {
  const parsed = parseIsoDate(value);
  if (!parsed) return "dd/mm/aaaa";
  return parsed.toLocaleDateString("pt-BR");
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildCalendarDays(month: Date) {
  const firstDayOfMonth = startOfMonth(month);
  const firstWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const daysInPreviousMonth = new Date(month.getFullYear(), month.getMonth(), 0).getDate();

  const leadingDays = Array.from({ length: firstWeekday }, (_, index) => {
    const day = daysInPreviousMonth - firstWeekday + index + 1;
    return {
      date: new Date(month.getFullYear(), month.getMonth() - 1, day),
      currentMonth: false,
    };
  });

  const currentDays = Array.from({ length: daysInMonth }, (_, index) => ({
    date: new Date(month.getFullYear(), month.getMonth(), index + 1),
    currentMonth: true,
  }));

  const totalCells = Math.ceil((leadingDays.length + currentDays.length) / 7) * 7;
  const trailingDays = Array.from({ length: totalCells - leadingDays.length - currentDays.length }, (_, index) => ({
    date: new Date(month.getFullYear(), month.getMonth() + 1, index + 1),
    currentMonth: false,
  }));

  return [...leadingDays, ...currentDays, ...trailingDays];
}

export function BrazilianDatePicker({ value, onChange, className = "", disabled = false }: BrazilianDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(parseIsoDate(value) ?? new Date()));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedDate = parseIsoDate(value);
    if (selectedDate) {
      setMonth(startOfMonth(selectedDate));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const weekdayLabels = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5, 6].map((day) =>
        new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(new Date(2024, 0, day + 7))
      ),
    []
  );

  const calendarDays = useMemo(() => buildCalendarDays(month), [month]);
  const monthLabel = month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const selectedDate = parseIsoDate(value);

  function selectDate(date: Date) {
    onChange(toIsoDate(date));
    setMonth(startOfMonth(date));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left text-sm text-gray-900 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={selectedDate ? "text-gray-900" : "text-gray-400"}>
          {formatDisplayDate(value)}
        </span>
        <span className="text-gray-400">📅</span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[19rem] rounded-lg border p-3 shadow-xl brazil-datepicker-panel"
             style={{ backgroundColor: "var(--panel-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setMonth((current) => addMonths(current, -1))}
              className="rounded-md p-1.5 text-gray-700 transition hover:bg-black/10"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="text-sm font-semibold text-[var(--app-text)]">{monthLabel}</div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-gray-700 transition hover:bg-black/10"
                aria-label="Fechar calendário"
              >
                <X size={16} />
              </button>
              <button
                type="button"
                onClick={() => setMonth((current) => addMonths(current, 1))}
                className="rounded-md p-1.5 text-gray-700 transition hover:bg-black/10"
                aria-label="Próximo mês"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-text)]">
            {weekdayLabels.map((label) => (
              <div key={label} className="py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, currentMonth }) => {
              const isoDate = toIsoDate(date);
              const isSelected = selectedDate ? toIsoDate(selectedDate) === isoDate : false;

              return (
                <button
                  key={isoDate}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={`h-8 rounded-md text-sm transition outline-none flex items-center justify-center ${
                    currentMonth ? "hover:bg-blue-100" : "text-[var(--muted-text)] hover:bg-black/5"
                  } ${isSelected ? "bg-unasp-navy text-white" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-md px-2 py-1 text-[var(--unasp-navy)] transition hover:bg-[var(--accent-bg)]"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => selectDate(new Date())}
              className="rounded-md px-2 py-1 text-[var(--unasp-navy)] transition hover:bg-[var(--accent-bg)]"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}