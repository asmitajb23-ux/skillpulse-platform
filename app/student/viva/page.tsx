"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  ChevronRight,
  FolderKanban,
  Loader2,
  Send,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useStudentData } from "@/hooks/use-student-data";
import { completeViva, evaluateVivaAnswer, generateVivaQuestions } from "@/services/viva";
import { vivaAnswerSchema } from "@/lib/validation";
import { formatDate } from "@/lib/utils";
import type { VivaSession } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state-views";
import { ScoreRing } from "@/components/score-ring";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "ai" | "student";
  content: string;
  evaluation?: { score: number; feedback: string };
}

type Step = "setup" | "chat" | "result";

export default function VivaPage() {
  const { user } = useAuth();
  const { bundle, loading, error, reload } = useStudentData();
  const [step, setStep] = useState<Step>("setup");
  const [topicType, setTopicType] = useState<"project" | "skill">("project");
  const [topicId, setTopicId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<{ question: string }[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<VivaSession | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[480px]" />
      </div>
    );
  }
  if (error || !bundle || !user) return <ErrorState message={error ?? "Failed to load."} onRetry={reload} />;

  const projects = bundle.projects;
  const studentSkills = bundle.profile.skills;

  const startSession = () => {
    if (!topicId) {
      toast.error("Select a project or skill to start the viva");
      return;
    }
    const topicName =
      topicType === "project"
        ? projects.find((p) => p.id === topicId)?.title ?? ""
        : studentSkills.find((s) => s.skill_id === topicId)?.skill_id
        ? (bundle.proofChain.find((p) => p.skill_id === topicId)?.skill_name ?? topicId)
        : topicId;

    const qs = generateVivaQuestions(topicType, topicName);
    setQuestions(qs);
    setAnswers([]);
    setQuestionIndex(0);
    setMessages([
      {
        role: "ai",
        content: `Welcome to your AI Viva on "${topicName}". I'll ask ${qs.length} questions and evaluate each answer. Question 1: ${qs[0].question}`,
      },
    ]);
    setResult(null);
    setStep("chat");
  };

  const submitAnswer = () => {
    const parsed = vivaAnswerSchema.safeParse(input);
    if (!parsed.success) {
      setInputError(parsed.error.issues[0].message);
      return;
    }
    setInputError(null);
    const currentQuestion = questions[questionIndex];
    const evaluation = evaluateVivaAnswer(currentQuestion.question, input);

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "student", content: input },
      {
        role: "ai",
        content: evaluation.evaluation,
        evaluation: { score: evaluation.score, feedback: evaluation.feedback },
      },
    ];
    const newAnswers = [...answers, input];
    setThinking(true);
    setInput("");

    // Simulate AI thinking latency
    setTimeout(() => {
      setThinking(false);
      setAnswers(newAnswers);
      const nextIndex = questionIndex + 1;
      if (nextIndex < questions.length) {
        setMessages([
          ...newMessages,
          { role: "ai", content: `Question ${nextIndex + 1}: ${questions[nextIndex].question}` },
        ]);
        setQuestionIndex(nextIndex);
      } else {
        setMessages(newMessages);
        const session = completeViva({
          studentId: user.id,
          topicType,
          topicId,
          topicName:
            topicType === "project"
              ? projects.find((p) => p.id === topicId)?.title ?? topicId
              : bundle.proofChain.find((p) => p.skill_id === topicId)?.skill_name ?? topicId,
          questions: questions.map((q) => ({ question: q.question })),
          answers: newAnswers,
        });
        setResult(session);
        setStep("result");
        toast.success(`Viva complete — you scored ${session.score}%`);
      }
    }, 900);
  };

  const resetToSetup = () => {
    setStep("setup");
    setMessages([]);
    setResult(null);
    setTopicId("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Viva</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An AI interviewer probes your projects and skills — viva performance is worth 20 points
          of each related skill&apos;s verification score.
        </p>
      </div>

      {step === "setup" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Start a New Viva
              </CardTitle>
              <CardDescription>Choose what the AI should interview you about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => { setTopicType("project"); setTopicId(""); }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    topicType === "project" ? "border-primary bg-indigo-50/60 ring-1 ring-primary" : "hover:border-primary/40"
                  )}
                >
                  <FolderKanban className={cn("mb-2 h-5 w-5", topicType === "project" ? "text-primary" : "text-muted-foreground")} />
                  <p className="text-sm font-semibold">Project viva</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Defend architecture, decisions and challenges</p>
                </button>
                <button
                  onClick={() => { setTopicType("skill"); setTopicId(""); }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    topicType === "skill" ? "border-primary bg-indigo-50/60 ring-1 ring-primary" : "hover:border-primary/40"
                  )}
                >
                  <Trophy className={cn("mb-2 h-5 w-5", topicType === "skill" ? "text-primary" : "text-muted-foreground")} />
                  <p className="text-sm font-semibold">Skill viva</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Answer conceptual and applied questions</p>
                </button>
              </div>

              <div className="space-y-2">
                {topicType === "project" ? (
                  projects.length === 0 ? (
                    <EmptyState
                      icon={<FolderKanban className="h-5 w-5" />}
                      title="No projects to run a viva on"
                      description="Add a project to your portfolio first."
                      action={{ label: "Go to portfolio", href: "/student/portfolio" }}
                    />
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setTopicId(p.id)}
                          className={cn(
                            "rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                            topicId === p.id ? "border-primary bg-indigo-50/60 ring-1 ring-primary" : "hover:border-primary/40"
                          )}
                        >
                          <p className="font-medium">{p.title}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.technologies.join(" · ")}</p>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {studentSkills.map((s) => {
                      const proof = bundle.proofChain.find((p) => p.skill_id === s.skill_id);
                      return (
                        <button
                          key={s.skill_id}
                          onClick={() => setTopicId(s.skill_id)}
                          className={cn(
                            "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                            topicId === s.skill_id ? "border-primary bg-indigo-50/60 ring-1 ring-primary" : "hover:border-primary/40"
                          )}
                        >
                          <span className="font-medium">{proof?.skill_name ?? s.skill_id}</span>
                          <Badge variant="muted">proof {proof?.verification_score ?? 0}</Badge>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button onClick={startSession} disabled={topicType === "project" && projects.length === 0}>
                <Bot className="h-4 w-4" /> Generate questions &amp; start viva
              </Button>
            </CardContent>
          </Card>

          <VivaHistory sessions={bundle.vivas} />
        </div>
      )}

      {step === "chat" && (
        <Card className="mx-auto max-w-3xl">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                  <Bot className="h-4 w-4" />
                </span>
                AI Viva Interviewer
              </CardTitle>
              <CardDescription>
                Question {questionIndex + 1} of {questions.length}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetToSetup}>End session</Button>
          </CardHeader>
          <CardContent>
            <div className="h-[380px] space-y-4 overflow-y-auto rounded-xl bg-slate-50 p-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2.5", m.role === "student" ? "justify-end" : "justify-start")}>
                  {m.role === "ai" && (
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <Bot className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "student"
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md border bg-white"
                    )}
                  >
                    {m.content}
                    {m.evaluation && (
                      <div className="mt-2 border-t pt-2">
                        <Badge variant={m.evaluation.score >= 75 ? "success" : m.evaluation.score >= 55 ? "warning" : "destructive"}>
                          Answer score: {m.evaluation.score}/100
                        </Badge>
                        <p className="mt-1.5 text-xs text-muted-foreground">{m.evaluation.feedback}</p>
                      </div>
                    )}
                  </div>
                  {m.role === "student" && (
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                      <User className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              ))}
              {thinking && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> AI is evaluating your answer…
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="mt-4 space-y-2">
              <Textarea
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer… (be specific — mention concepts, examples and reasoning)"
                disabled={thinking}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitAnswer();
                }}
              />
              {inputError && <p className="text-xs text-destructive">{inputError}</p>}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Tip: press Ctrl+Enter to send</p>
                <Button onClick={submitAnswer} disabled={thinking}>
                  <Send className="h-4 w-4" /> Send answer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "result" && result && (
        <div className="mx-auto max-w-3xl space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-6 pt-8 sm:flex-row sm:justify-around">
              <ScoreRing value={result.score} size={130} label="viva score" />
              <div className="text-center sm:text-left">
                <h2 className="text-lg font-semibold">Viva complete: {result.topic_name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(result.completed_at)} · {result.questions.length} questions evaluated
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Button variant="outline" size="sm" onClick={resetToSetup}>
                    Start another viva
                  </Button>
                  <Link href="/student/proof-chain">
                    <Button size="sm">See proof chain impact <ChevronRight className="h-3.5 w-3.5" /></Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-700">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-700">Areas to Improve</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Question-wise Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.questions.map((q, i) => (
                <div key={i} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">Q{i + 1}. {q.question}</p>
                    <Badge variant={(q.score ?? 0) >= 75 ? "success" : (q.score ?? 0) >= 55 ? "warning" : "destructive"}>
                      {q.score}/100
                    </Badge>
                  </div>
                  {result.answers[i] && (
                    <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                      <span className="font-semibold">Your answer:</span> {result.answers[i]}
                    </p>
                  )}
                  {q.feedback && <p className="mt-2 text-xs text-muted-foreground">{q.feedback}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function VivaHistory({ sessions }: { sessions: VivaSession[] }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Past Viva Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No viva sessions yet. Complete one to boost your verification scores.
          </p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.topic_name}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {s.topic_type} viva · {formatDate(s.completed_at)}
                  </p>
                </div>
                <Badge variant={s.score >= 75 ? "success" : s.score >= 55 ? "warning" : "destructive"}>
                  {s.score}%
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
