"use client";

// ============================================================================
// DRAG & DROP BUILDER - Phase 3
// ============================================================================
// Drag-and-drop section reordering with @dnd-kit

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check,GripVertical } from "lucide-react";
import { useState } from "react";

import { SECTION_REGISTRY } from "../core/SectionRegistry";
import type { SectionKey } from "../types";

interface SortableSectionProps {
  sectionKey: SectionKey;
  title: string;
  isSelected: boolean;
  onToggle: () => void;
}

function SortableSection({
  sectionKey,
  title,
  isSelected,
  onToggle,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: sectionKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 border-b border-gray-200 px-6 py-4 ${
        isSelected ? "bg-blue-50" : "bg-white"
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={`Toggle ${title}`}
      />

      {/* Section info */}
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{sectionKey}</div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
          <Check className="h-4 w-4" />
          <span>Included</span>
        </div>
      )}
    </div>
  );
}

interface DragBuilderProps {
  selectedSections: SectionKey[];
  onSectionsChange: (sections: SectionKey[]) => void;
}

export default function DragBuilder({
  selectedSections,
  onSectionsChange,
}: DragBuilderProps) {
  const [allSections] = useState<SectionKey[]>(
    Object.values(SECTION_REGISTRY)
      .sort((a, b) => a.order - b.order)
      .map((s) => s.key)
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedSections.indexOf(active.id as SectionKey);
      const newIndex = selectedSections.indexOf(over.id as SectionKey);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(selectedSections, oldIndex, newIndex);
        onSectionsChange(reordered);
      }
    }
  };

  const toggleSection = (key: SectionKey) => {
    if (selectedSections.includes(key)) {
      onSectionsChange(selectedSections.filter((k) => k !== key));
    } else {
      onSectionsChange([...selectedSections, key]);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Sections ({selectedSections.length})
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Drag to reorder, check to include in export
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={selectedSections}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-gray-200">
            {allSections.map((key) => {
              const section = SECTION_REGISTRY[key];
              return (
                <SortableSection
                  key={key}
                  sectionKey={key}
                  title={section.title}
                  isSelected={selectedSections.includes(key)}
                  onToggle={() => toggleSection(key)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
