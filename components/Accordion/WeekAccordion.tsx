"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Calendar, Check } from "lucide-react";
import { Week, Lesson } from "@/lib/firestore";
import { LessonItem } from "./LessonItem";

interface WeekAccordionProps {
    week: Week;
    lessons: Lesson[];
    userProgress: Record<string, boolean>;
    activeLessonId?: string;
    indentLevel?: number;
}

export function WeekAccordion({
    week,
    lessons,
    userProgress,
    activeLessonId,
    indentLevel = 3
}: WeekAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const completedCount = lessons.filter(l => userProgress[l.id]).length;
    const totalCount = lessons.length;
    const isComplete = completedCount === totalCount && totalCount > 0;

    const paddingLeft = `${indentLevel * 16}px`;

    return (
        <div>
            {/* Week Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-50 transition-colors group"
                style={{ paddingLeft }}
            >
                {/* Chevron */}
                <div className="flex-shrink-0">
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                </div>

                {/* Icon */}
                <Calendar className="w-4 h-4 text-secondary" />

                {/* Title */}
                <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{week.title}</div>
                </div>

                {/* Progress */}
                {isComplete ? (
                    <div className="flex-shrink-0 text-green-500">
                        <Check className="w-4 h-4" />
                    </div>
                ) : (
                    <div className="flex-shrink-0 text-xs text-gray-400 font-medium">
                        {completedCount}/{totalCount}
                    </div>
                )}
            </button>

            {/* Lessons */}
            {isExpanded && (
                <div className="space-y-0.5">
                    {lessons.map((lesson) => (
                        <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            isCompleted={userProgress[lesson.id] || false}
                            isActive={lesson.id === activeLessonId}
                            indentLevel={indentLevel + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
