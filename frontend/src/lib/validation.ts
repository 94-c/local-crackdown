export function validateEmail(email: string): string | null {
  if (!email.trim()) return "이메일을 입력해주세요";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "올바른 이메일 형식이 아닙니다";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "비밀번호를 입력해주세요";
  if (password.length < 6) return "비밀번호는 6자 이상이어야 합니다";
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName}을(를) 입력해주세요`;
  return null;
}

export function validateNumber(
  value: number | string,
  fieldName: string,
  { min, max }: { min?: number; max?: number } = {}
): string | null {
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return `${fieldName}은(는) 숫자여야 합니다`;
  if (min !== undefined && num < min) return `${fieldName}은(는) ${min} 이상이어야 합니다`;
  if (max !== undefined && num > max) return `${fieldName}은(는) ${max} 이하여야 합니다`;
  return null;
}
