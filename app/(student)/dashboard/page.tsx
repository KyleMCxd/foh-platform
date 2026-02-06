"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useModules } from "@/lib/hooks/useModules";
import { useUserData } from "@/lib/hooks/useUserData";
import { getLessonsForModule, Lesson } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { Play, Check, Lock, BookOpen, Clock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { modules, isLoading: modulesLoading } = useModules();
  const { progress, isLoading: progressLoading } = useUserData(user?.uid);
  const [moduleLessons, setModuleLessons] = useState<Record<string, Lesson[]>>({});
  const [lessonsLoading, setLessonsLoading] = useState(true);

  // Fetch lessons for all modules to calculate completion
  useEffect(() => {
    async function fetchAllLessons() {
      if (modules.length === 0) {
        setLessonsLoading(false);
        return;
      }

      const lessonsMap: Record<string, Lesson[]> = {};
      for (const module of modules) {
        try {
          const lessons = await getLessonsForModule(module.id);
          lessonsMap[module.id] = lessons;
        } catch (error) {
          console.error(`Failed to fetch lessons for module ${module.id}:`, error);
          lessonsMap[module.id] = [];
        }
      }
      setModuleLessons(lessonsMap);
      setLessonsLoading(false);
    }

    fetchAllLessons();
  }, [modules]);

  // Calculate if a module is complete (all lessons completed)
  const isModuleComplete = (moduleId: string): boolean => {
    const lessons = moduleLessons[moduleId] || [];
    if (lessons.length === 0) return false;
    return lessons.every(lesson => progress[lesson.id] === true);
  };

  // Calculate module status
  const getModuleStatus = (moduleId: string, index: number): "completed" | "current" | "locked" => {
    if (isModuleComplete(moduleId)) return "completed";

    // Check if at least one lesson in this module is started
    const lessons = moduleLessons[moduleId] || [];
    const hasProgress = lessons.some(lesson => progress[lesson.id] === true);
    if (hasProgress) return "current";

    // Check if previous module is complete
    if (index === 0) return "current"; // First module is always available
    const prevModule = modules[index - 1];
    if (prevModule && isModuleComplete(prevModule.id)) return "current";

    return "locked";
  };

  // Calculate total completed modules
  const completedCount = modules.filter(m => isModuleComplete(m.id)).length;

  // Find first incomplete module for "Continue Learning"
  const currentModuleIndex = modules.findIndex(m => !isModuleComplete(m.id));
  const currentModule = currentModuleIndex >= 0 ? modules[currentModuleIndex] : modules[modules.length - 1];

  const loading = modulesLoading || progressLoading || lessonsLoading;

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
              {modules.length > 0
                ? `Je hebt ${completedCount} van de ${modules.length} modules afgerond. Blijf zo doorgaan!`
                : "Je curriculum wordt voorbereid. Check later weer!"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-green-700">Modules compleet</div>
            </div>
            <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
              <div className="text-2xl font-bold text-cyan-600">{modules.length > 0 ? modules.length - completedCount : 0}</div>
              <div className="text-sm text-cyan-700">Modules te gaan</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0}%
              </div>
              <div className="text-sm text-purple-700">Voortgang</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Continue Learning */}
          {modules.length > 0 && currentModule && (
            <section>
              <h2 className="text-xl font-bold mb-4">Ga verder met leren</h2>
              <Link
                href={`/module/${currentModule.id}`}
                className="block md:w-fit min-w-[400px] bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-gradient flex items-center justify-center text-white">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Module {currentModule.order}
                      </p>
                      <h3 className="font-bold text-lg">
                        {currentModule.title}
                      </h3>
                    </div>
                  </div>
                  <div className="text-primary font-medium group-hover:translate-x-1 transition-transform whitespace-nowrap">
                    Doorgaan →
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* All Modules Grid */}
          <section>
            <h2 className="text-xl font-bold mb-4">Alle Modules</h2>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-border rounded-2xl">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nog geen curriculum content.
                </p>
                <Link
                  href="/admin"
                  className="text-primary font-medium hover:underline"
                >
                  Ga naar Admin Panel →
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module, index) => {
                  const status = getModuleStatus(module.id, index);
                  return (
                    <Link
                      key={module.id}
                      href={`/module/${module.id}`}
                      className={`block p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${status === "current"
                          ? "bg-white border-secondary shadow-md scale-[1.02]"
                          : status === "completed"
                            ? "bg-white border-border hover:border-primary/30"
                            : "bg-gray-50 border-transparent opacity-60 hover:opacity-100"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Module {module.order}
                        </span>
                        {status === "completed" && (
                          <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        {status === "locked" && (
                          <Lock className="w-4 h-4 text-gray-300" />
                        )}
                        {status === "current" && (
                          <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                            Huidig
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-2">
                        {module.title.includes(":")
                          ? module.title.split(": ")[1]
                          : module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {module.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
