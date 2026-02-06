"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Package, Check } from "lucide-react";
import { Block, Module, Week, Lesson } from "@/lib/firestore";
import { ModuleAccordion } from "./ModuleAccordion";

interface BlockAccordionProps {
    block: Block;
    modules: Module[];
    weeks: Week[];
    lessons: Lesson[];
    userProgress: Record<string, boolean>;
    activeLessonId?: string;
    indentLevel?: number;
}

export function BlockAccordion({
    block,
    modules,
    weeks,
    lessons,
    userProgress,
    activeLessonId,
    indentLevel = 1
}: BlockAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate progress
    const blockLessons = lessons.filter(l => l.blockId === block.id);
    const completedCount = blockLessons.filter(l => userProgress[l.id]).length;
    const totalCount = blockLessons.length;
    const isComplete = completedCount === totalCount && totalCount > 0;

    const paddingLeft = `${indentLevel * 16}px`;

    return (
        <div>
            {/* Block Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50 transition-colors group"
                style={{ paddingLeft }}
            >
                {/* Chevron */}
                <div className="flex-shrink-0">
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                    )}
                </div>

                {/* Icon */}
                <Package className="w-5 h-5 text-secondary" />

                {/* Title */}
                <div className="flex-1 text-left">
                    <div className="font-bold text-gray-800 uppercase text-xs tracking-wider group-hover:text-gray-900">
                        {block.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{block.description}</div>
                </div>

                {/* Progress */}
                {isComplete ? (
                    <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                ) : (
                    <div className="flex-shrink-0 text-xs text-gray-500 font-semibold">
                        {completedCount}/{totalCount}
                    </div>
                )}
            </button>

            {/* Modules */}
            {isExpanded && (
                <div className="space-y-0.5 mt-1">
                    {modules
                        .filter(module => module.blockId === block.id)
                        .map((module) => {
                            const moduleWeeks = weeks.filter(w => w.moduleId === module.id);
                            return (
                                <ModuleAccordion
                                    key={module.id}
                                    module={module}
                                    weeks={moduleWeeks}
                                    lessons={lessons}
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
