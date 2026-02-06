"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, GraduationCap, Check } from "lucide-react";
import { Semester, Block, Module, Week, Lesson } from "@/lib/firestore";
import { BlockAccordion } from "./BlockAccordion";

interface SemesterAccordionProps {
    semester: Semester;
    blocks: Block[];
    modules: Module[];
    weeks: Week[];
    lessons: Lesson[];
    userProgress: Record<string, boolean>;
    activeLessonId?: string;
}

export function SemesterAccordion({
    semester,
    blocks,
    modules,
    weeks,
    lessons,
    userProgress,
    activeLessonId
}: SemesterAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(true); // Expand first semester by default

    // Calculate progress
    const semesterLessons = lessons.filter(l => l.semesterId === semester.id);
    const completedCount = semesterLessons.filter(l => userProgress[l.id]).length;
    const totalCount = semesterLessons.length;
    const isComplete = completedCount === totalCount && totalCount > 0;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="mb-4">
            {/* Semester Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50 transition-colors rounded-lg border border-gray-200 group"
            >
                {/* Chevron */}
                <div className="flex-shrink-0">
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                    )}
                </div>

                {/* Icon */}
                <GraduationCap className="w-6 h-6 text-primary" />

                {/* Title */}
                <div className="flex-1 text-left">
                    <div className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                        {semester.title}
                    </div>
                    {semester.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{semester.description}</div>
                    )}
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                    {isComplete ? (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-xs font-semibold text-green-600">100%</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-600 font-semibold">
                                {completedCount}/{totalCount}
                            </div>
                            <div className="text-xs text-gray-400">
                                ({progressPercentage}%)
                            </div>
                        </div>
                    )}
                </div>
            </button>

            {/* Blocks */}
            {isExpanded && (
                <div className="mt-2 space-y-1 border-l border-gray-200 ml-4">
                    {blocks
                        .filter(block => block.semesterId === semester.id)
                        .map((block) => {
                            const blockModules = modules.filter(m => m.blockId === block.id);
                            return (
                                <BlockAccordion
                                    key={block.id}
                                    block={block}
                                    modules={blockModules}
                                    weeks={weeks}
                                    lessons={lessons}
                                    userProgress={userProgress}
                                    activeLessonId={activeLessonId}
                                    indentLevel={1}
                                />
                            );
                        })}
                </div>
            )}
        </div>
    );
}
