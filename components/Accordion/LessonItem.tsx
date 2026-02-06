"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Calendar, Check, Play } from "lucide-react";
import Link from "next/link";
import { Lesson } from "@/lib/firestore";

interface LessonItemProps {
    lesson: Lesson;
    isCompleted: boolean;
    isActive?: boolean;
    indentLevel?: number;
}

export function LessonItem({ lesson, isCompleted, isActive, indentLevel = 4 }: LessonItemProps) {
    const paddingLeft = `${indentLevel * 16}px`;

    return (
        <Link
            href={`/watch/${lesson.id}`}
            className={`flex items-center gap-3 px-4 py-2.5 transition-colors group ${isActive
                ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-l-2 border-primary"
                : "hover:bg-gray-50"
                }`}
            style={{ paddingLeft }}
        >
            {/* Icon */}
            <div className="flex-shrink-0">
                {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600" />
                    </div>
                ) : (
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Play className="w-3 h-3 text-primary" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">{lesson.number}</span>
                    <span className={`text-sm ${isCompleted ? "text-gray-400 line-through" : isActive ? "text-primary font-medium" : "text-gray-800"}`}>
                        {lesson.title}
                    </span>
                </div>
                {lesson.duration && (
                    <span className="text-xs text-gray-400">{lesson.duration}</span>
                )}
            </div>
        </Link>
    );
}
