/**
 * ==============================================================================
 * 🌲 HELPDESK RUNBOOK TREE - SESSION STORE & AUDIT TRAIL ENGINE
 * ==============================================================================
 * Layer: Core Engine (@backend / mowftee-guild)
 * Purpose: Local-First persistent storage for active sessions, historical audit
 *          trails, user preferences, and JSON backup/restore.
 * ==============================================================================
 */

import type { Runbook, DiagnosticSession, TargetOS } from '../types/runbook';
import { TraversalEngine } from './traversal';

/**
 * Các khóa định danh lưu trữ trong LocalStorage.
 */
export const STORAGE_KEYS = {
  ACTIVE_SESSION: 'helpdesk_active_session',
  ARCHIVE_SESSIONS: 'helpdesk_session_archive',
  USER_SETTINGS: 'helpdesk_user_settings',
} as const;

/**
 * Cấu hình cá nhân hóa của kỹ thuật viên.
 */
export interface UserSettings {
  technicianName: string;
  preferredOS: TargetOS;
  autoCopyOnSelect: boolean;
  terminalTheme: 'dark' | 'light' | 'matrix';
}

const DEFAULT_SETTINGS: UserSettings = {
  technicianName: '',
  preferredOS: 'windows',
  autoCopyOnSelect: true,
  terminalTheme: 'dark',
};

// In-memory fallback trong trường hợp môi trường không có LocalStorage (Node.js/Private browsing)
const memoryStorage = new Map<string, string>();

function safeGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (err) {
    console.warn(`[SessionStore] Không thể đọc localStorage key "${key}":`, err);
  }
  return memoryStorage.get(key) || null;
}

function safeSet(key: string, value: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch (err) {
    console.warn(`[SessionStore] Không thể ghi localStorage key "${key}":`, err);
  }
  memoryStorage.set(key, value);
  return true;
}

function safeRemove(key: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return true;
    }
  } catch (err) {
    console.warn(`[SessionStore] Không thể xóa localStorage key "${key}":`, err);
  }
  memoryStorage.delete(key);
  return true;
}

type SessionChangeListener = (session: DiagnosticSession | null) => void;

/**
 * Lớp quản trị kho lưu trữ phiên chẩn đoán Local-First (SessionStore).
 */
export class SessionStore {
  private activeEngine: TraversalEngine | null = null;
  private listeners = new Set<SessionChangeListener>();

  constructor() {}

  // --------------------------------------------------------------------------
  // LISTENER SUBSCRIPTIONS (REACTIVE SVELTE 5 ADAPTER)
  // --------------------------------------------------------------------------

  /**
   * Đăng ký nhận thông báo thay đổi trạng thái phiên chẩn đoán.
   */
  public subscribe(listener: SessionChangeListener): () => void {
    this.listeners.add(listener);
    // Gửi giá trị hiện tại ngay khi đăng ký
    listener(this.getActiveSession());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyChange(): void {
    const current = this.getActiveSession();
    for (const listener of this.listeners) {
      try {
        listener(current);
      } catch (e) {
        console.error('[SessionStore] Lỗi trong subscriber listener:', e);
      }
    }
  }

  // --------------------------------------------------------------------------
  // ACTIVE SESSION MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Khởi tạo một phiên chẩn đoán mới cho Runbook và tự động lưu phiên.
   */
  public startSession(
    runbook: Runbook,
    options?: { ticketId?: string; technicianName?: string }
  ): TraversalEngine {
    const settings = this.getSettings();
    const effectiveName = options?.technicianName || settings.technicianName;

    this.activeEngine = new TraversalEngine(runbook, {
      ticketId: options?.ticketId,
      technicianName: effectiveName,
      autoValidate: true,
    });

    this.persistActiveSession();
    this.notifyChange();
    return this.activeEngine;
  }

  /**
   * Lấy Engine điều hướng đang hoạt động (nếu có).
   */
  public getActiveEngine(): TraversalEngine | null {
    return this.activeEngine;
  }

  /**
   * Lấy dữ liệu phiên đang hoạt động từ bộ nhớ hoặc LocalStorage.
   */
  public getActiveSession(): DiagnosticSession | null {
    if (this.activeEngine) {
      return this.activeEngine.toDiagnosticSession();
    }

    const raw = safeGet(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw) as DiagnosticSession;
      if (session && session.sessionId && session.runbookId) {
        return session;
      }
    } catch (e) {
      console.error('[SessionStore] Lỗi parse active session từ localStorage:', e);
    }
    return null;
  }

  /**
   * Kiểm tra xem hiện có phiên chẩn đoán nào đang làm dở không.
   */
  public hasActiveSession(): boolean {
    return this.activeEngine !== null || safeGet(STORAGE_KEYS.ACTIVE_SESSION) !== null;
  }

  /**
   * Tự động lưu tiến trình hiện tại của activeEngine vào LocalStorage.
   */
  public persistActiveSession(): void {
    if (!this.activeEngine) {
      safeRemove(STORAGE_KEYS.ACTIVE_SESSION);
      return;
    }

    const sessionData = this.activeEngine.toDiagnosticSession();
    safeSet(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(sessionData));
  }

  /**
   * Khôi phục phiên dở dang từ LocalStorage dựa trên danh mục Runbook đã đăng ký.
   */
  public resumeActiveSession(
    runbookRegistry: Record<string, Runbook>
  ): TraversalEngine | null {
    const saved = this.getActiveSession();
    if (!saved) return null;

    const runbook = runbookRegistry[saved.runbookId];
    if (!runbook) {
      console.warn(`[SessionStore] Runbook ID "${saved.runbookId}" không tìm thấy trong Registry.`);
      return null;
    }

    try {
      this.activeEngine = TraversalEngine.fromDiagnosticSession(runbook, saved);
      this.notifyChange();
      return this.activeEngine;
    } catch (err) {
      console.error('[SessionStore] Khôi phục session thất bại:', err);
      return null;
    }
  }

  /**
   * Hoàn tất phiên hiện tại, lưu vào Kho Lưu Trữ (Archive) và xóa Active Session.
   */
  public completeAndArchiveSession(): DiagnosticSession {
    if (!this.activeEngine) {
      throw new Error('Không có phiên chẩn đoán nào đang hoạt động để hoàn tất.');
    }

    const completedSession = this.activeEngine.toDiagnosticSession();
    this.addToArchive(completedSession);

    // Dọn dẹp active session
    this.activeEngine = null;
    safeRemove(STORAGE_KEYS.ACTIVE_SESSION);
    this.notifyChange();

    return completedSession;
  }

  /**
   * Hủy bỏ phiên hiện tại mà không lưu lại hoặc đánh dấu abandoned.
   */
  public abandonActiveSession(saveToArchive: boolean = true): void {
    if (this.activeEngine && saveToArchive) {
      const abandoned = this.activeEngine.toDiagnosticSession();
      abandoned.status = 'abandoned';
      abandoned.completedAt = new Date().toISOString();
      this.addToArchive(abandoned);
    }

    this.activeEngine = null;
    safeRemove(STORAGE_KEYS.ACTIVE_SESSION);
    this.notifyChange();
  }

  // --------------------------------------------------------------------------
  // ARCHIVE & HISTORY MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Lấy danh sách tất cả các phiên chẩn đoán đã hoàn tất từ trước đến nay.
   */
  public getArchivedSessions(): DiagnosticSession[] {
    const raw = safeGet(STORAGE_KEYS.ARCHIVE_SESSIONS);
    if (!raw) return [];
    try {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.error('[SessionStore] Lỗi đọc danh sách archive:', e);
      return [];
    }
  }

  /**
   * Tìm một phiên đã lưu trữ theo Session ID.
   */
  public getArchivedSessionById(sessionId: string): DiagnosticSession | undefined {
    const list = this.getArchivedSessions();
    return list.find(s => s.sessionId === sessionId);
  }

  /**
   * Thêm một phiên hoàn tất vào kho lưu trữ (tự động đảo ngược theo thời gian mới nhất).
   */
  private addToArchive(session: DiagnosticSession): void {
    const currentList = this.getArchivedSessions();
    // Giữ tối đa 100 phiên gần nhất để chống tràn bộ nhớ localStorage
    const filtered = currentList.filter(s => s.sessionId !== session.sessionId);
    const updated = [session, ...filtered].slice(0, 100);
    safeSet(STORAGE_KEYS.ARCHIVE_SESSIONS, JSON.stringify(updated));
  }

  /**
   * Xóa một phiên khỏi kho lưu trữ.
   */
  public deleteArchivedSession(sessionId: string): boolean {
    const currentList = this.getArchivedSessions();
    const updated = currentList.filter(s => s.sessionId !== sessionId);
    safeSet(STORAGE_KEYS.ARCHIVE_SESSIONS, JSON.stringify(updated));
    return true;
  }

  /**
   * Xóa toàn bộ kho lưu trữ phiên cũ.
   */
  public clearAllArchives(): void {
    safeRemove(STORAGE_KEYS.ARCHIVE_SESSIONS);
  }

  // --------------------------------------------------------------------------
  // USER PREFERENCES & SETTINGS
  // --------------------------------------------------------------------------

  /**
   * Lấy cài đặt cá nhân của kỹ thuật viên.
   */
  public getSettings(): UserSettings {
    const raw = safeGet(STORAGE_KEYS.USER_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Cập nhật cài đặt cá nhân.
   */
  public saveSettings(patch: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated: UserSettings = { ...current, ...patch };
    safeSet(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // --------------------------------------------------------------------------
  // BACKUP, IMPORT & EXPORT
  // --------------------------------------------------------------------------

  /**
   * Xuất một phiên chẩn đoán cụ thể (hoặc phiên active) ra chuỗi JSON.
   */
  public exportSessionToJson(sessionId?: string): string {
    let session: DiagnosticSession | null | undefined = null;
    if (sessionId) {
      session = this.getArchivedSessionById(sessionId);
    } else {
      session = this.getActiveSession();
    }

    if (!session) {
      throw new Error(`Không tìm thấy session để xuất file.`);
    }

    return JSON.stringify(session, null, 2);
  }

  /**
   * Nhập một phiên chẩn đoán từ chuỗi JSON và lưu vào Archive.
   */
  public importSessionFromJson(jsonString: string): DiagnosticSession {
    let parsed: DiagnosticSession;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      throw new Error(`Dữ liệu JSON không đúng định dạng: ${(e as Error).message}`);
    }

    if (!parsed.sessionId || !parsed.runbookId || !Array.isArray(parsed.stepHistory)) {
      throw new Error('Dữ liệu JSON không thỏa mãn cấu trúc DiagnosticSession chuẩn ITIL.');
    }

    this.addToArchive(parsed);
    return parsed;
  }

  /**
   * Xuất toàn bộ dữ liệu (cài đặt, active session, archive) thành 1 file backup.
   */
  public exportFullBackup(): string {
    const backupPayload = {
      app: 'helpdesk-runbook-tree',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      activeSession: this.getActiveSession(),
      archivedSessions: this.getArchivedSessions(),
    };
    return JSON.stringify(backupPayload, null, 2);
  }

  /**
   * Nhập toàn bộ dữ liệu từ file backup.
   */
  public importFullBackup(backupJson: string): { importedSessions: number; settingsRestored: boolean } {
    let payload: any;
    try {
      payload = JSON.parse(backupJson);
    } catch (e) {
      throw new Error(`File backup bị lỗi cú pháp JSON: ${(e as Error).message}`);
    }

    if (payload.app !== 'helpdesk-runbook-tree') {
      throw new Error('File backup không thuộc về ứng dụng helpdesk-runbook-tree.');
    }

    let importedCount = 0;
    if (Array.isArray(payload.archivedSessions)) {
      for (const s of payload.archivedSessions) {
        if (s.sessionId && s.runbookId) {
          this.addToArchive(s);
          importedCount++;
        }
      }
    }

    if (payload.settings) {
      this.saveSettings(payload.settings);
    }

    if (payload.activeSession && payload.activeSession.sessionId) {
      safeSet(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(payload.activeSession));
      this.notifyChange();
    }

    return { importedSessions: importedCount, settingsRestored: Boolean(payload.settings) };
  }

  /**
   * Xóa sạch toàn bộ dữ liệu cục bộ (Reset hoàn toàn ứng dụng).
   */
  public clearAllData(): void {
    this.activeEngine = null;
    safeRemove(STORAGE_KEYS.ACTIVE_SESSION);
    safeRemove(STORAGE_KEYS.ARCHIVE_SESSIONS);
    safeRemove(STORAGE_KEYS.USER_SETTINGS);
    this.notifyChange();
  }
}

/**
 * Singleton instance mặc định của SessionStore dùng chung toàn ứng dụng.
 */
export const sessionStore = new SessionStore();
