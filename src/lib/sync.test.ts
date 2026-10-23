import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CloudSaver, resolveInitial, type CloudAdapter } from './sync';
import { defaultState } from './storage';
import { recordAttempt } from './spacedRepetition';
import type { AppState } from '../types';

const at = (updatedAt: number, patch: Partial<AppState> = {}): AppState => ({ ...defaultState(), updatedAt, ...patch });
const withProgress = (updatedAt: number) => at(updatedAt, { problems: { 'two-sum': recordAttempt(undefined, '2026-10-19', 3) } });

describe('resolveInitial', () => {
  it('prefers the cloud copy', () => {
    const cloud = at(200);
    expect(resolveInitial(cloud, at(100), null)).toEqual({ state: cloud, needsUpload: false });
  });

  it('keeps newer unsynced local changes and uploads them', () => {
    const cache = at(300);
    expect(resolveInitial(at(200), cache, null)).toEqual({ state: cache, needsUpload: true });
  });

  it('carries over pre-login progress on first sign-in', () => {
    const anon = withProgress(50);
    expect(resolveInitial(null, null, anon)).toEqual({ state: anon, needsUpload: true });
  });

  it('ignores an empty anonymous state', () => {
    const { state, needsUpload } = resolveInitial(null, null, at(10));
    expect(state.updatedAt).toBe(0);
    expect(needsUpload).toBe(true);
  });
});

describe('CloudSaver', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const adapter = (save: CloudAdapter['save']): CloudAdapter => ({ load: async () => null, save });

  it('debounces rapid edits into one save of the latest state', async () => {
    const save = vi.fn(async () => {});
    const statuses: string[] = [];
    const saver = new CloudSaver(adapter(save), (s) => statuses.push(s), 1000);
    saver.schedule(at(1));
    saver.schedule(at(2));
    saver.schedule(at(3));
    await vi.advanceTimersByTimeAsync(1000);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(at(3));
    expect(statuses.at(-1)).toBe('saved');
  });

  it('retries a failed save with the newest state', async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValue(undefined);
    const statuses: string[] = [];
    const saver = new CloudSaver(adapter(save), (s) => statuses.push(s), 100, 1000);
    saver.schedule(at(1));
    await vi.advanceTimersByTimeAsync(100);
    expect(statuses.at(-1)).toBe('error');
    saver.schedule(at(2));
    await vi.advanceTimersByTimeAsync(1000);
    expect(save).toHaveBeenLastCalledWith(at(2));
    expect(statuses.at(-1)).toBe('saved');
  });

  it('never runs two saves at once', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const save = vi.fn(async () => {
      maxInFlight = Math.max(maxInFlight, ++inFlight);
      await new Promise((r) => setTimeout(r, 500));
      inFlight--;
    });
    const saver = new CloudSaver(adapter(save), () => {}, 10);
    saver.schedule(at(1));
    await vi.advanceTimersByTimeAsync(10);
    saver.schedule(at(2));
    await vi.advanceTimersByTimeAsync(2000);
    expect(save).toHaveBeenCalledTimes(2);
    expect(maxInFlight).toBe(1);
  });
});
