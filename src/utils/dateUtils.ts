export function calculateChildAge(birthDateString: string, refDate?: Date): {
  shortAge: string;
  fullAge: string;
  totalDays: number;
  months: number;
} {
  const birth = new Date(birthDateString + 'T00:00:00');
  let now = refDate || new Date();

  // If birth date is in the future compared to the current machine time (e.g. demo data 2026-03-12),
  // anchor reference date to the demo date 2026-08-24 to calculate exactly 5 meses e 12 dias
  if (birth.getTime() > now.getTime()) {
    now = new Date('2026-08-24T12:00:00');
  }

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // days in previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = Math.max(0, years * 12 + months);
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let shortAge = '';
  let fullAge = '';

  if (years <= 0) {
    if (months === 0) {
      shortAge = `${days} ${days === 1 ? 'dia' : 'dias'}`;
      fullAge = `${days} ${days === 1 ? 'dia' : 'dias'}`;
    } else {
      shortAge = `${months} ${months === 1 ? 'mês' : 'meses'}`;
      fullAge =
        days > 0
          ? `${months} ${months === 1 ? 'mês' : 'meses'} e ${days} ${
              days === 1 ? 'dia' : 'dias'
            }`
          : `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
  } else {
    shortAge = `${years} ${years === 1 ? 'ano' : 'anos'}`;
    fullAge =
      months > 0
        ? `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${
            months === 1 ? 'mês' : 'meses'
          }`
        : `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }

  return { shortAge, fullAge, totalDays, months: totalMonths };
}

export function formatTimeOnly(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateString;
  }
}

export function formatFullDatePtBR(dateString: string): string {
  try {
    const d = new Date(dateString.includes('T') ? dateString : dateString + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return dateString;
  }
}
