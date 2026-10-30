export interface TimeZoneOption {
  value: string;
  label: string;
}

export const TIME_ZONE_OPTIONS: TimeZoneOption[] = [
  { value: 'Asia/Kolkata', label: 'New Delhi, India - GMT + 05:30 (IST)' },
  { value: 'Europe/Paris', label: 'Paris, France - GMT + 01:00 (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin, Germany - GMT + 01:00 (CET)' },
  { value: 'Europe/London', label: 'London, UK - GMT + 00:00 (GMT)' },
  { value: 'America/New_York', label: 'New York, USA - GMT - 05:00 (EST)' },
  { value: 'Asia/Dubai', label: 'Dubai, UAE - GMT + 04:00 (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore - GMT + 08:00 (SGT)' },
];

export const DEFAULT_TIME_ZONE = 'Asia/Kolkata';
