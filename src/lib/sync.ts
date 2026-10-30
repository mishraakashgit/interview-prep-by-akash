import { defaultState, hasProgress } from './storage';
import type { AppState } from '../types';

export type SyncStatus = 'local' | 'saving' | 'saved' | 'offline' | 'error';

export interface CloudAdapter {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
}

/**
 * Picks the state to start from after sign-in.
 * - Cloud copy wins unless this browser holds newer, unsynced changes for the same user.
 * - With no cloud copy yet, progress made before signing in on this browser is carried over.
 */
export function resolveInitial(
  cloud: AppState | null,
  userCache: AppState | null,
  anonymous: AppState | null,
): { state: AppState; needsUpload: boolean } {
  if (cloud && userCache && userCache.updatedAt > cloud.updatedAt) return { state: userCache, needsUpload: true };
  if (cloud) return { state: cloud, needsUpload: false };
  if (userCache) return { state: userCache, needsUpload: true };
  if (anonymous && hasProgress(anonymous)) return { state: anonymous, needsUpload: true };
  return { state: defaultState(), needsUpload: true };
}

/**
 * Debounced, serialized cloud writes: many quick edits become one request,
 * saves never overlap, and failures are retried with the latest state.
 */
export class CloudSaver {
  private pending: AppState | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private chain: Promise<void> = Promise.resolve();

  constructor(
    private adapter: CloudAdapter,
    private onStatus: (status: SyncStatus, savedAt?: number, error?: string) => void,
    private delayMs = 1500,
    private retryMs = 10_000,
  ) {}

  schedule(state: AppState): void {
    this.pending = state;
    this.onStatus('saving');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), this.delayMs);
  }

  flush(): Promise<void> {
    clearTimeout(this.timer);
    this.chain = this.chain.then(() => this.savePending());
    return this.chain;
  }

  dispose(): void {
    clearTimeout(this.timer);
  }

  private async savePending(): Promise<void> {
    const state = this.pending;
    if (!state) return;
    this.pending = null;
    try {
      await this.adapter.save(state);
      if (!this.pending) this.onStatus('saved', Date.now());
    } catch (e) {
      this.pending ??= state; // keep the newest state for the retry
      this.onStatus(globalThis.navigator?.onLine === false ? 'offline' : 'error', undefined, (e as Error)?.message);
      this.timer = setTimeout(() => void this.flush(), this.retryMs);
    }
  }
}
