"use client";

import { useState, useTransition } from "react";
import type { SaveResult } from "@/lib/actions/creatorProfile";

/** Runs a save action and keeps its pending state + last result for the UI. */
export function useSave() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SaveResult>({});

  const save = (action: () => Promise<SaveResult>) =>
    startTransition(async () => {
      setResult(await action());
    });

  return { save, pending, result, setResult };
}
