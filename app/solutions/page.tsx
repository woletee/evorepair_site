import { redirect } from 'next/navigation';
import programs from '@/app/data/programs.json';

function uniqIds(items: { task_name: string }[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const it of items) {
    const id = it.task_name.replace('.json', '');
    if (!seen.has(id)) { seen.add(id); out.push(id); }
  }
  return out;
}

export default function SolutionsRoot() {
  const ids = uniqIds(programs as any[]);
  const randomId = ids.length ? ids[Math.floor(Math.random() * ids.length)] : '';
  redirect(randomId ? `/solutions/${randomId}` : '/');
}
