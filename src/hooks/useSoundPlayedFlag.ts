// hooks/useSoundPlayedFlag.ts
// サウンド再生フラグを管理するカスタムフック

import { useRef, useCallback } from 'react';

/**
 * サウンド再生フラグを管理するカスタムフック
 * 同じサウンドが重複して再生されないようにフラグを管理する
 *
 * @returns フラグ操作関数
 */
export function useSoundPlayedFlag() {
  const hasPlayedDealSoundRef = useRef(false);
  const hasPlayedResultSoundRef = useRef(false);

  /**
   * 全てのフラグをリセットする
   * ラウンド開始時などに呼び出す
   */
  const resetFlags = useCallback(() => {
    hasPlayedDealSoundRef.current = false;
    hasPlayedResultSoundRef.current = false;
  }, []);

  /**
   * カード配布サウンドの再生を試みる
   * まだ再生されていない場合のみtrueを返す
   *
   * @returns 再生すべきかどうか
   */
  const tryPlayDealSound = useCallback((): boolean => {
    if (hasPlayedDealSoundRef.current) {
      return false;
    }
    hasPlayedDealSoundRef.current = true;
    return true;
  }, []);

  /**
   * 結果サウンドの再生を試みる
   * まだ再生されていない場合のみtrueを返す
   *
   * @returns 再生すべきかどうか
   */
  const tryPlayResultSound = useCallback((): boolean => {
    if (hasPlayedResultSoundRef.current) {
      return false;
    }
    hasPlayedResultSoundRef.current = true;
    return true;
  }, []);

  /**
   * カード配布サウンドが再生済みかどうか
   */
  const hasPlayedDealSound = useCallback(() => hasPlayedDealSoundRef.current, []);

  /**
   * 結果サウンドが再生済みかどうか
   */
  const hasPlayedResultSound = useCallback(() => hasPlayedResultSoundRef.current, []);

  return {
    resetFlags,
    tryPlayDealSound,
    tryPlayResultSound,
    hasPlayedDealSound,
    hasPlayedResultSound,
  };
}
