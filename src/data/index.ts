import { networkRunbook } from './network-runbook';
import type { Runbook } from '../types/runbook';

/**
 * Registry tập trung tất cả các bộ kịch bản chẩn đoán Runbook trong hệ thống.
 * Cho phép truy xuất O(1) theo Runbook ID.
 */
export const runbookRegistry: Record<string, Runbook> = {
  [networkRunbook.id]: networkRunbook,
};

/**
 * Runbook mặc định khi người dùng mở ứng dụng lần đầu.
 */
export const defaultRunbook: Runbook = networkRunbook;

/**
 * Lấy danh sách tất cả các Runbook đã đăng ký.
 */
export function getAllRunbooks(): Runbook[] {
  return Object.values(runbookRegistry);
}

/**
 * Tìm kiếm Runbook theo ID với thời gian O(1).
 */
export function getRunbookById(id: string): Runbook | undefined {
  return runbookRegistry[id];
}

export { networkRunbook };
