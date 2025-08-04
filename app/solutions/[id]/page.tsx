import React from 'react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import Grid from '@/app/Components/Grid';
import DotGraph from '@/app/Components/DotGraph';
import TaskSwitcher from '@/app/Components/TaskSwitcher';
import programs from '@/app/data/programs.json';

type ArcPair = { input: number[][]; output: number[][] };
type ArcTask = { train: ArcPair[]; test: { input: number[][] }[] };

async function loadArcTask(id: string): Promise<ArcTask | null> {
  const p = path.join(process.cwd(), 'public', 'arc', `${id}.json`);
  try {
    const buf = await fs.readFile(p, 'utf8');
    return JSON.parse(buf) as ArcTask;
  } catch {
    return null;
  }
}

function uniqIds(items: { task_name: string }[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const it of items) {
    const id = it.task_name.replace('.json', '');
    if (!seen.has(id)) { seen.add(id); out.push(id); }
  }
  return out.sort();
}

/** === Fit grids nicely in the left column === */
const MAX_GRID_PX = 220;
const MIN_CELL = 8;
const MAX_CELL = 18;
function calcCellSize(matrix: number[][]): number {
  const rows = matrix.length || 1;
  const cols = matrix[0]?.length || 1;
  const ideal = Math.floor(Math.min(MAX_GRID_PX / rows, MAX_GRID_PX / cols));
  return Math.max(MIN_CELL, Math.min(MAX_CELL, ideal));
}

/** ---- Program string -> DOT graph (Graphviz) ---- */
function programToDot(program: string): string {
  type Tok = { t: 'id' | '(' | ')' | ','; v?: string };
  const toks: Tok[] = [];
  {
    const s = program.trim();
    let i = 0;
    const isIdChar = (c: string) => /[A-Za-z0-9_]/.test(c);
    while (i < s.length) {
      const c = s[i];
      if (c === '(' || c === ')' || c === ',') { toks.push({ t: c }); i++; }
      else if (/\s/.test(c)) { i++; }
      else {
        let j = i;
        while (j < s.length && isIdChar(s[j])) j++;
        toks.push({ t: 'id', v: s.slice(i, j) });
        i = j;
      }
    }
  }

  let pos = 0, idCounter = 0;
  const nodes: string[] = [];
  const edges: string[] = [];
  const newNode = (label: string) => {
    const nid = `node${idCounter++}`;
    nodes.push(`${nid} [label="${escapeLabel(label)}"]`);
    return nid;
  };
  function expect(t: Tok['t']) { const k = toks[pos]; if (!k || k.t !== t) throw new Error('parse'); pos++; }
  function peek() { return toks[pos]; }
  function parseExpr(): string {
    const tk = peek(); if (!tk || tk.t !== 'id') throw new Error('parse');
    pos++; const label = tk.v as string;
    if (peek() && peek()!.t === '(') {
      expect('(');
      const parent = newNode(label);
      if (peek() && peek()!.t !== ')') {
        const c1 = parseExpr(); edges.push(`${parent} -> ${c1}`);
        while (peek() && peek()!.t === ',') { expect(','); const c = parseExpr(); edges.push(`${parent} -> ${c}`); }
      }
      expect(')'); return parent;
    }
    return newNode(label);
  }
  try { parseExpr(); }
  catch { nodes.length = 0; edges.length = 0; nodes.push(`node0 [label="${escapeLabel(program)}"]`); }

  return `digraph G {
    node [style=filled, shape=ellipse, fillcolor=lightgreen, fontname=Helvetica];
    ${nodes.join('\n    ')}
    ${edges.join('\n    ')}
  }`;
}
function escapeLabel(s: string) { return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }

/** Next.js 15: `params` is async — await it. */
export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const task = await loadArcTask(id);
  if (!task) notFound();

  const allIds = uniqIds(programs as any[]);
  const matches = (programs as any[]).filter((p) => p.task_name === `${id}.json`);
  const solved = matches.some((m) => m.solution_found);
  const programStrings = matches.map((m) => m.best_program);

  return (
    <main className="p-6">
      {/* Header with dropdown */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{id}</h1>
          <p className="text-sm text-gray-600">
            {solved ? 'Solution found' : 'No solution found'}
          </p>
        </div>
        <TaskSwitcher ids={allIds} currentId={id} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: ARC task visuals (compact) */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-medium mb-3">Training Examples</h2>
            <div className="space-y-6">
              {task.train.map((pair, idx) => {
                const inSize = calcCellSize(pair.input);
                const outSize = calcCellSize(pair.output);
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="text-sm mb-1">Input</div>
                      <div className="max-w-[240px]">
                        <Grid matrix={pair.input} cellSize={inSize} />
                      </div>
                    </div>
                    <div className="self-center">→</div>
                    <div className="shrink-0">
                      <div className="text-sm mb-1">Output</div>
                      <div className="max-w-[240px]">
                        <Grid matrix={pair.output} cellSize={outSize} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-3">Test Inputs</h2>
            <div className="flex flex-wrap gap-4">
              {task.test.map((t, idx) => {
                const tSize = calcCellSize(t.input);
                return (
                  <div key={idx} className="shrink-0">
                    <div className="text-sm mb-1">Test {idx + 1}</div>
                    <div className="max-w-[240px]">
                      <Grid matrix={t.input} cellSize={tSize} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT: AST graphs */}
        <aside className="lg:sticky lg:top-6 h-fit">
          <h2 className="text-xl font-medium mb-3">Program graph(s)</h2>
          {programStrings.length ? (
            <div className="space-y-6">
              {programStrings.map((p, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-sm font-mono break-words text-gray-600">
                    Program #{i + 1}: {p}
                  </div>
                  <div className="max-h-[70vh] overflow-auto rounded border bg-white">
                    <DotGraph dot={programToDot(p)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No program recorded for this task.</p>
          )}
        </aside>
      </div>
    </main>
  );
}
