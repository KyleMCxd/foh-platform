"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useModules } from "@/lib/hooks/useModules";
import { useAuth } from "@/lib/auth";
import { Play, Check, Lock, BookOpen, Clock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { modules, isLoading: loading } = useModules();

  // Demo: first 3 modules completed
  const getStatus = (index: number) => {
    if (index < 3) return "completed";
    if (index === 3) return "current";
    return "locked";
  };

  const completedCount = 3; // Demo value

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
          {modules.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Ga verder met leren</h2>
              <Link
                href={`/module/${modules[Math.min(completedCount, modules.length - 1)]?.id}`}
                className="block md:w-fit min-w-[400px] bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-gradient flex items-center justify-center text-white">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Module {modules[Math.min(completedCount, modules.length - 1)]?.order}
                      </p>
                      <h3 className="font-bold text-lg">
                        {modules[Math.min(completedCount, modules.length - 1)]?.title}
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
                  const status = getStatus(index);
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
