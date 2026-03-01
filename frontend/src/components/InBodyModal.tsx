"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { InBodyRecord } from "@/lib/types";

interface InBodyModalProps {
  challengeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InBodyModal({
  challengeId,
  isOpen,
  onClose,
  onSuccess,
}: InBodyModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [recordDate, setRecordDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [fatMass, setFatMass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fatPercentage =
    weight && fatMass
      ? ((parseFloat(fatMass) / parseFloat(weight)) * 100).toFixed(1)
      : null;

  const validate = (): string | null => {
    const w = parseFloat(weight);
    const m = parseFloat(muscleMass);
    const f = parseFloat(fatMass);

    if (w < 30 || w > 200) return "체중은 30~200kg 사이로 입력해주세요.";
    if (m < 10 || m > 60) return "골격근량은 10~60kg 사이로 입력해주세요.";
    if (f < 1 || f > 100) return "체지방량은 1~100kg 사이로 입력해주세요.";
    if (m + f > w)
      return "골격근량 + 체지방량은 체중을 초과할 수 없습니다.";
    return null;
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post<InBodyRecord>("/api/inbody", {
        challengeId: challengeId || undefined,
        weight: parseFloat(weight),
        skeletalMuscleMass: parseFloat(muscleMass),
        bodyFatMass: parseFloat(fatMass),
        recordDate,
      });
      onSuccess();
      onClose();
      setWeight("");
      setMuscleMass("");
      setFatMass("");
      setRecordDate(today);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "인바디 등록에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold">인바디 기록 추가</h2>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="modal-date" className="block text-sm font-medium">
              측정일
            </label>
            <input
              id="modal-date"
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
            />
          </div>

          <div>
            <label htmlFor="modal-weight" className="block text-sm font-medium">
              체중 (kg)
            </label>
            <input
              id="modal-weight"
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              placeholder="예: 70.5"
            />
          </div>

          <div>
            <label htmlFor="modal-muscle" className="block text-sm font-medium">
              골격근량 (kg)
            </label>
            <input
              id="modal-muscle"
              type="number"
              step="0.1"
              required
              value={muscleMass}
              onChange={(e) => setMuscleMass(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              placeholder="예: 28.3"
            />
          </div>

          <div>
            <label htmlFor="modal-fatmass" className="block text-sm font-medium">
              체지방량 (kg)
            </label>
            <input
              id="modal-fatmass"
              type="number"
              step="0.1"
              required
              value={fatMass}
              onChange={(e) => setFatMass(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
              placeholder="예: 15.2"
            />
            {fatPercentage && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                체지방률: {fatPercentage}%
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-6 py-3 transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !weight || !muscleMass || !fatMass}
            className="flex-1 rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
