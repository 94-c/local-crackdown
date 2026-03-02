"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { ErrorAlert, FormField } from "@/components/ui";
import { validateNumber } from "@/lib/validation";
import type { InBodyRecord } from "@/lib/types";

interface InBodyModalProps {
  challengeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRecord?: InBodyRecord;
}

export default function InBodyModal({
  challengeId,
  isOpen,
  onClose,
  onSuccess,
  editRecord,
}: InBodyModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [recordDate, setRecordDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [fatMass, setFatMass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (editRecord) {
      setRecordDate(editRecord.recordDate);
      setWeight(String(editRecord.weight));
      setMuscleMass(String(editRecord.skeletalMuscleMass));
      setFatMass(editRecord.bodyFatMass != null ? String(editRecord.bodyFatMass) : "");
    } else {
      setRecordDate(today);
      setWeight("");
      setMuscleMass("");
      setFatMass("");
    }
    setError("");
    setFieldErrors({});
  }, [editRecord, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const payload = {
        challengeId,
        weight: parseFloat(weight),
        skeletalMuscleMass: parseFloat(muscleMass),
        bodyFatMass: parseFloat(fatMass),
        recordDate,
      };

      if (editRecord) {
        await apiClient.put<InBodyRecord>(`/api/inbody/${editRecord.id}`, payload);
      } else {
        await apiClient.post<InBodyRecord>("/api/inbody", payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editRecord
            ? "인바디 수정에 실패했습니다"
            : "인바디 등록에 실패했습니다"
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
        <h2 className="text-xl font-bold">
          {editRecord ? "인바디 기록 수정" : "인바디 기록 추가"}
        </h2>

        {error && (
          <div className="mt-4">
            <ErrorAlert message={error} onDismiss={() => setError("")} />
          </div>
        )}

        <div className="mt-4 space-y-4">
          <FormField label="측정일">
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-white"
            />
          </FormField>

          <FormField label="체중 (kg)" error={fieldErrors.weight ?? undefined} required>
            <input
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onBlur={() =>
                setFieldErrors((prev) => ({
                  ...prev,
                  weight: validateNumber(weight, "체중", { min: 30, max: 200 }),
                }))
              }
              className={`block w-full rounded-lg border px-4 py-3 focus:outline-none dark:bg-gray-900 ${
                fieldErrors.weight
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black dark:border-gray-700 dark:focus:border-white"
              }`}
              placeholder="예: 70.5"
            />
          </FormField>

          <FormField label="골격근량 (kg)" error={fieldErrors.muscleMass ?? undefined} required>
            <input
              type="number"
              step="0.1"
              required
              value={muscleMass}
              onChange={(e) => setMuscleMass(e.target.value)}
              onBlur={() =>
                setFieldErrors((prev) => ({
                  ...prev,
                  muscleMass: validateNumber(muscleMass, "골격근량", { min: 10, max: 60 }),
                }))
              }
              className={`block w-full rounded-lg border px-4 py-3 focus:outline-none dark:bg-gray-900 ${
                fieldErrors.muscleMass
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black dark:border-gray-700 dark:focus:border-white"
              }`}
              placeholder="예: 28.3"
            />
          </FormField>

          <FormField label="체지방량 (kg)" error={fieldErrors.fatMass ?? undefined} required hint={fatPercentage ? `체지방률: ${fatPercentage}%` : undefined}>
            <input
              type="number"
              step="0.1"
              required
              value={fatMass}
              onChange={(e) => setFatMass(e.target.value)}
              onBlur={() =>
                setFieldErrors((prev) => ({
                  ...prev,
                  fatMass: validateNumber(fatMass, "체지방량", { min: 1, max: 100 }),
                }))
              }
              className={`block w-full rounded-lg border px-4 py-3 focus:outline-none dark:bg-gray-900 ${
                fieldErrors.fatMass
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-black dark:border-gray-700 dark:focus:border-white"
              }`}
              placeholder="예: 15.2"
            />
          </FormField>
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
            {loading ? "저장 중..." : editRecord ? "수정" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
