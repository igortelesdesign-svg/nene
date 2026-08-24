import { ChildSex } from '../types';

export const CHILD_SEX_OPTIONS: { value: ChildSex; label: string }[] = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
  { value: 'other', label: 'Outro' },
  { value: 'not_informed', label: 'Prefiro não informar' },
];

/**
 * Normaliza qualquer valor recebido para os valores estritos aceitos pelo Supabase
 * ('male' | 'female' | 'other' | 'not_informed').
 */
export function normalizeChildSex(sex?: string | null): ChildSex {
  if (!sex) return 'not_informed';
  const clean = sex.toString().trim().toLowerCase();
  if (clean === 'male' || clean === 'm' || clean === 'masculino') return 'male';
  if (clean === 'female' || clean === 'f' || clean === 'feminino') return 'female';
  if (clean === 'other' || clean === 'outro') return 'other';
  if (
    clean === 'not_informed' ||
    clean === 'prefiro não informar' ||
    clean === 'prefiro_nao_informar' ||
    clean === 'não informado' ||
    clean === 'nao_informado'
  ) {
    return 'not_informed';
  }
  return 'not_informed';
}

/**
 * Converte o valor de sexo do Supabase para o texto amigável em português na interface.
 */
export function formatChildSex(sex?: string | null): string {
  const normalized = normalizeChildSex(sex);
  switch (normalized) {
    case 'male':
      return 'Masculino';
    case 'female':
      return 'Feminino';
    case 'other':
      return 'Outro';
    case 'not_informed':
    default:
      return 'Prefiro não informar';
  }
}
