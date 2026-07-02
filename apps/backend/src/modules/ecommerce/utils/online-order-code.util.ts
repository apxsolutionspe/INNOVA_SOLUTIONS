export function buildOnlineOrderCode(next: number) {
  return `WEB-${String(next).padStart(6, '0')}`;
}
