// src/components/claims/EditableField.tsx
"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EditableFieldProps {
  label: string;
  value: string | null;
  onSave: (newValue: string) => Promise<void>;
  type?: "text" | "email" | "tel" | "date";
  placeholder?: string;
  mono?: boolean;
}

export function EditableField({
  label,
  value,
  onSave,
  type = "text",
  placeholder,
  mono = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save");
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div>
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            placeholder={placeholder}
            className={`flex-1 rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground outline-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${mono ? "font-mono" : ""}`}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            title="Save"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="rounded-lg bg-muted p-2 text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {saving && <p className="mt-1 text-xs text-muted-foreground">Saving...</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <button
        onClick={() => setIsEditing(true)}
        className={`mt-1 w-full cursor-pointer rounded-lg px-3 py-2 text-left text-base text-foreground transition-colors hover:bg-muted ${mono ? "font-mono" : ""} ${!value ? "italic text-muted-foreground" : "font-medium"}`}
      >
        {value || placeholder || "Click to edit"}
      </button>
    </div>
  );
}
