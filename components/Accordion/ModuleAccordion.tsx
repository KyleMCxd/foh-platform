"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Book, Check } from "lucide-react";
import { Module, Week, Lesson } from "@/lib/firestore";
import { WeekAccordion } from "./WeekAccordion";

interface ModuleAccordionProps {
    module: Module;
    weeks: Week[];
    lessons: Lesson[];
    userProgress: Record<string, boolean>;
    activeLessonId?: string;
    indentLevel?: number;
}

export function ModuleAccordion({
    module,
    weeks,
    lessons,
    userProgress,
    activeLessonId,
    indentLevel = 2
}: ModuleAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate progress
    const moduleLessons = lessons.filter(l => l.moduleId === module.id);
    const completedCount = moduleLessons.filter(l => userProgress[l.id]).length;
    const totalCount = moduleLessons.length;
    const isComplete = completedCount === totalCount && totalCount > 0;

    const paddingLeft = `${indentLevel * 16}px`;

    return (
        <div>
            {/* Module Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-gray-50 transition-colors group"
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
                <Book className="w-4 h-4 text-primary" />

                {/* Title */}
                <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{module.title}</div>
                </div>

                {/* Progress */}
                {isComplete ? (
                    <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                        </div>
                    </div>
                ) : (
                    <div className="flex-shrink-0 text-xs text-gray-500 font-medium">
                        {completedCount}/{totalCount}
                    </div>
                )}
            </button>

            {/* Weeks */}
            {isExpanded && (
                <div className="space-y-0.5">
                    {weeks
                        .filter(week => week.moduleId === module.id)
                        .map((week) => {
                            const weekLessons = lessons.filter(l => l.weekId === week.id);
                            return (
                                <WeekAccordion
                                    key={week.id}
                                    week={week}
                                    lessons={weekLessons}
                                    userProgress={userProgress}
                                    activeLessonId={activeLessonId}
                                    indentLevel={indentLevel + 1}
                                />
                            );
                        })}
                </div>
            )}
        </div>
    );
}
