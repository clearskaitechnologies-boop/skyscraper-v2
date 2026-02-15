"use client";

import React, { createContext, useCallback,useContext, useState } from "react";

import { saveStormIntake } from "@/lib/storm-intake/api";
import type { StormIntakeDTO } from "@/lib/storm-intake/types";

interface StormIntakeContextValue {
  intake: StormIntakeDTO;
  setIntake: (updater: (prev: StormIntakeDTO) => StormIntakeDTO) => void;
  isSaving: boolean;
  savePartial: (partial: Partial<StormIntakeDTO>) => Promise<void>;
}

const StormIntakeContext = createContext<StormIntakeContextValue | null>(null);

export function useStormIntake() {
  const ctx = useContext(StormIntakeContext);
  if (!ctx) {
    throw new Error("useStormIntake must be used within StormIntakeProvider");
  }
  return ctx;
}

interface Props {
  initialIntake: StormIntakeDTO;
  children: React.ReactNode;
}

export function StormIntakeProvider({ initialIntake, children }: Props) {
  const [intake, setIntakeState] = useState<StormIntakeDTO>(initialIntake);
  const [isSaving, setIsSaving] = useState(false);

  const setIntake = useCallback((updater: (prev: StormIntakeDTO) => StormIntakeDTO) => {
    setIntakeState((prev) => updater(prev));
  }, []);

  const savePartial = useCallback(
    async (partial: Partial<StormIntakeDTO>) => {
      setIsSaving(true);
      try {
        const updated = await saveStormIntake(intake.id, partial);
        setIntakeState(updated);
      } catch (error) {
        console.error("[StormIntake] Save failed:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [intake.id]
  );

  return (
    <StormIntakeContext.Provider value={{ intake, setIntake, isSaving, savePartial }}>
      {children}
    </StormIntakeContext.Provider>
  );
}
