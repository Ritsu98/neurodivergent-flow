/**
 * Last-write-wins using ISO 8601 timestamps (PRODUCT_SPEC §9).
 */
export function shouldApplyRemote(
  localUpdatedAt: string | undefined | null,
  remoteUpdatedAt: string | undefined | null
): boolean {
  if (!remoteUpdatedAt) return false;
  if (!localUpdatedAt) return true;
  return remoteUpdatedAt >= localUpdatedAt;
}
