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
import { Play, Check, Lock, BookOpen, Clock, GraduationCap, Award, ChevronRight, Timer, Mic2, Volume2, Zap } from "lucide-react";
import { useSessionTimer } from "@/components/providers/SessionTimerProvider";



export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch all hierarchy data
  const { semesters, loading: semestersLoading } = useSemesters();
  const { blocks, loading: blocksLoading } = useBlocks();
  const { modules, isLoading: modulesLoading } = useModules();
  const { weeks, loading: weeksLoading } = useWeeks();
  const { lessons, isLoading: lessonsLoading } = useLessons();
  const { progress, isLoading: progressLoading } = useUserData(user?.uid);

  // Study time tracking
  // Timer from context
  const { totalStudyTime, formatTime } = useSessionTimer();

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
      const weekA = weeks.find(w => w.id === a.weekId);
      const weekB = weeks.find(w => w.id === b.weekId);

      const weekNumA = weekA?.weekNumber || 0;
      const weekNumB = weekB?.weekNumber || 0;

      if (weekNumA !== weekNumB) {
        return weekNumA - weekNumB;
      }

      // If same week, sort by lesson order
      return a.order - b.order;
    });

    return sortedLessons.find(l => !progress?.[l.id]);
  };

  const nextLesson = getNextLesson();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Content flows over fixed background */}
      <div className="relative px-8 py-8">

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 text-white flex items-center gap-3">
              Welkom backstage{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
              {/* Theater Spotlight Icon - Stage Light Fixture */}
              {/* Theater Armature Icon - Shining Left */}
              <svg className="w-16 h-16 text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)] animate-pulse-slow" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {/* Ceiling Mount */}
                <path d="M48 4v8" strokeWidth="3" />
                <path d="M42 12h12" strokeWidth="3" />

                {/* Yoke/Bracket */}
                <path d="M48 12v6" />
                <path d="M38 18h20" />
                <path d="M38 18v10" />
                <path d="M58 18v10" />

                {/* Main Housing - Can/Par - Pointing Left */}
                {/* Back of can */}
                <path d="M56 28l-4 20" />
                <path d="M44 28l4 20" />
                <path d="M44 28h12" /> {/* Top back */}
                <path d="M48 48h4" />   {/* Bottom back */}

                {/* Front Cone/Barndoors - Shining Left */}
                <path d="M44 28 L24 20" /> {/* Top cone line */}
                <path d="M48 48 L28 56" /> {/* Bottom cone line */}
                <ellipse cx="26" cy="38" rx="6" ry="18" transform="rotate(20 26 38)" fill="currentColor" fillOpacity="0.2" /> {/* Lens/Face */}

                {/* Light Beams - Shining Left/Down */}
                <path d="M20 30 L4 24" strokeOpacity="0.5" strokeDasharray="4 4" />
                <path d="M18 38 L2 38" strokeOpacity="0.5" strokeDasharray="4 4" />
                <path d="M22 46 L6 54" strokeOpacity="0.5" strokeDasharray="4 4" />
              </svg>
            </h1>
            <p className="text-slate-300 text-lg">
              {totalLessons > 0
                ? `Je hebt ${completedLessons} van de ${totalLessons} scenes afgerond. De show gaat door!`
                : "Je curriculum wordt voorbereid. Check later weer!"}
            </p>
          </div>

          {/* Colorful Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Completed */}
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-5 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute -right-2 -bottom-2 opacity-20 group-hover:opacity-30 transition-opacity">
                <Check className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">Voltooid</p>
                <p className="text-3xl font-extrabold">{completedLessons}<span className="text-lg font-medium text-white/70">/{totalLessons}</span></p>
              </div>
            </div>

            {/* To Go */}
            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-5 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute -right-2 -bottom-2 opacity-20 group-hover:opacity-30 transition-opacity">
                <BookOpen className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">Te Gaan</p>
                <p className="text-3xl font-extrabold">{totalLessons - completedLessons} <span className="text-lg font-medium text-white/70">lessen</span></p>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute -right-2 -bottom-2 opacity-20 group-hover:opacity-30 transition-opacity">
                <Award className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">Voortgang</p>
                <p className="text-3xl font-extrabold">{progressPercentage}%</p>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-white transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>
            </div>

            {/* Weeks */}
            <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-5 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute -right-2 -bottom-2 opacity-20 group-hover:opacity-30 transition-opacity">
                <Clock className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">Weken</p>
                <p className="text-3xl font-extrabold">{weeks.length} <span className="text-lg font-medium text-white/70">totaal</span></p>
              </div>
            </div>
          </div>


        </div>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Continue Learning - Large Featured Card (spans 2 cols) */}
            {nextLesson && (
              <Link
                href={`/watch/${nextLesson.id}`}
                className="lg:col-span-2 rounded-3xl p-8 hover:shadow-[0_0_50px_-10px_rgba(188,19,254,0.5)] transition-all group relative overflow-hidden"
                style={{
                  backgroundImage: `url('/theater-stage-bg.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Dark Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
                {/* Animated Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#BC13FE]/10 via-transparent to-[#00F0FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
                  <div>
                    <p className="text-sm text-[#00F0FF] uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Volgende Scene
                    </p>
                    <h3 className="font-extrabold text-2xl lg:text-3xl text-white mb-3">
                      {nextLesson.title}
                    </h3>
                    <div className="flex items-center gap-4 text-slate-300 text-sm">
                      <span className="bg-white/10 px-3 py-1 rounded-full">{nextLesson.number}</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {nextLesson.duration}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#BC13FE] to-[#00F0FF] flex items-center justify-center text-white shadow-[0_0_30px_rgba(188,19,254,0.4)] group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                    <div className="bg-white text-[#2a0845] font-bold px-6 py-3 rounded-xl group-hover:bg-[#00F0FF] group-hover:scale-105 transition-all shadow-lg">
                      Actie! →
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Study Time Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-32 h-32 text-amber-500" />
              </div>
              <div className="relative z-10 text-center">
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3">Tijd op het Podium</p>
                <p className="text-5xl font-extrabold text-slate-800 font-mono tracking-tight">{formatTime(totalStudyTime)}</p>
                <p className="text-xs text-slate-400 mt-4">Blijf oefenen, perfectie komt door herhaling!</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Semester Overview Section */}
      <div className="p-8 pt-0">
        <div className="max-w-7xl mx-auto">

          {/* Semester Overview */}
          {semesters.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                Je Voortgang per Semester
              </h2>
              <div className="grid gap-6">
                {semesters.map((semester) => {
                  const semProgress = getSemesterProgress(semester.id);
                  // Dynamic background based on semester type
                  const isGeluid = semester.title?.toLowerCase().includes('geluid');
                  const isLicht = semester.title?.toLowerCase().includes('licht');
                  const bgImage = isGeluid
                    ? '/semester-geluid-bg.png'
                    : isLicht
                      ? '/semester-licht-bg.png'
                      : '';
                  const overlayClass = isGeluid
                    ? 'bg-gradient-to-r from-[#0a1628]/90 via-[#122a4d]/70 to-[#0d1f3c]/50'
                    : isLicht
                      ? 'bg-gradient-to-r from-[#8b1a1a]/90 via-[#c41e3a]/70 to-transparent'
                      : 'bg-gradient-to-br from-[#130f40] via-[#2a0845] to-[#0f0c29]';
                  return (
                    <div
                      key={semester.id}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 hover:border-primary/50 transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_-5px_rgba(188,19,254,0.4)]"
                      style={{
                        backgroundImage: bgImage ? `url('${bgImage}')` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: isLicht ? 'right center' : 'center',
                      }}
                    >
                      {/* Dark Overlay for text readability */}
                      <div className={`absolute inset-0 ${overlayClass}`} />
                      {/* Background Gradient Mesh */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {/* Circle Graph */}
                        <div className="relative w-24 h-24 shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 - (251.2 * semProgress.percentage) / 100}
                              className="text-primary transition-all duration-1000 ease-out"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-xl font-black text-white">{semProgress.percentage}%</span>
                          </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-primary transition-colors">
                            {semester.title}
                          </h3>
                          {semester.description && (
                            <p className="text-zinc-400 text-sm font-medium mb-4 max-w-2xl">
                              {semester.description}
                            </p>
                          )}
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            <Check className="w-3 h-3 text-primary" />
                            {semProgress.completed} / {semProgress.total} Lessen Voltooid
                          </div>
                        </div>

                        <div className="w-full md:w-auto">
                          <Link href={`/curriculum?semester=${semester.id}`} className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-primary hover:text-white transition-all duration-300">
                            Ga naar Curriculum <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
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
