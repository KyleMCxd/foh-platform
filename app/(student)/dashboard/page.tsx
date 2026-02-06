"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSemesters } from "@/lib/hooks/useSemesters";
import { useBlocks } from "@/lib/hooks/useBlocks";
import { useModules } from "@/lib/hooks/useModules";
import { useWeeks } from "@/lib/hooks/useWeeks";
import { useLessons } from "@/lib/hooks/useLessons";
import { useUserData } from "@/lib/hooks/useUserData";
import { Lesson } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { Play, Check, Lock, BookOpen, Clock, GraduationCap, Award } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch all hierarchy data
  const { semesters, loading: semestersLoading } = useSemesters();
  const { blocks, loading: blocksLoading } = useBlocks();
  const { modules, isLoading: modulesLoading } = useModules();
  const { weeks, loading: weeksLoading } = useWeeks();
  const { lessons, isLoading: lessonsLoading } = useLessons();
  const { progress, isLoading: progressLoading } = useUserData(user?.uid);


  const loading = semestersLoading || blocksLoading || modulesLoading || weeksLoading || lessonsLoading || progressLoading;

  // Calculate total progress
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => progress?.[l.id]).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Calculate semester progress
  const getSemesterProgress = (semesterId: string) => {
    const semesterLessons = lessons.filter(l => l.semesterId === semesterId);
    const completed = semesterLessons.filter(l => progress?.[l.id]).length;
    return {
      total: semesterLessons.length,
      completed,
      percentage: semesterLessons.length > 0 ? Math.round((completed / semesterLessons.length) * 100) : 0
    };
  };

  // Find next lesson to continue
  const getNextLesson = () => {
    // Find first uncompleted lesson
    const sortedLessons = [...lessons].sort((a, b) => {
      // Sort by week number
      const weekA = weeks.find(w => w.id === a.weekId);
      const weekB = weeks.find(w => w.id === b.weekId);
      return (weekA?.weekNumber || 0) - (weekB?.weekNumber || 0);
    });

    return sortedLessons.find(l => !progress?.[l.id]);
  };

  const nextLesson = getNextLesson();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="bg-white border-b border-border px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              {totalLessons > 0
                ? `Je hebt ${completedLessons} van de ${totalLessons} lessen afgerond. Blijf zo doorgaan!`
                : "Je curriculum wordt voorbereid. Check later weer!"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl">
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{completedLessons}</div>
              <div className="text-sm text-green-600 font-medium">Lessen compleet</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl p-4 border border-cyan-200">
              <div className="text-2xl font-bold text-cyan-700">{totalLessons - completedLessons}</div>
              <div className="text-sm text-cyan-600 font-medium">Lessen te gaan</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{progressPercentage}%</div>
              <div className="text-sm text-purple-600 font-medium">Totaal voortgang</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{weeks.length}</div>
              <div className="text-sm text-orange-600 font-medium">Weken curriculum</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Continue Learning */}
          {nextLesson && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Ga verder met leren
              </h2>
              <Link
                href={`/watch/${nextLesson.id}`}
                className="block md:w-fit min-w-[400px] bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-gradient flex items-center justify-center text-white">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        {nextLesson.number}
                      </p>
                      <h3 className="font-bold text-lg">
                        {nextLesson.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {nextLesson.duration}
                      </p>
                    </div>
                  </div>
                  <div className="text-primary font-medium group-hover:translate-x-1 transition-transform whitespace-nowrap">
                    Start →
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Semester Overview */}
          {semesters.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Je Voortgang per Semester
              </h2>
              <div className="grid gap-6">
                {semesters.map((semester) => {
                  const semProgress = getSemesterProgress(semester.id);
                  return (
                    <div key={semester.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{semester.title}</h3>
                          {semester.description && (
                            <p className="text-sm text-muted-foreground mt-1">{semester.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{semProgress.percentage}%</div>
                          <div className="text-xs text-muted-foreground">{semProgress.completed}/{semProgress.total} lessen</div>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${semProgress.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
