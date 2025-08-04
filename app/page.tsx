export default function HomePage() {
  return (
    <main className="p-8 font-sans max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-4"></h1>

      <h2 className="text-2xl font-semibold mt-6">Evolving and Refining Code:A Neuro-Evolutionary Program Synthesis for
 Compositional Reasoning</h2>
      <p className="text-gray-500 mt-1">August 4, 2025</p>

      <img
        src="/framework.png"
        alt="Diagram"
        className="mt-6 rounded-xl border shadow-md"
      />

<p className="mt-6 text-lg leading-relaxed">
  We propose a neuro-evolutionary framework for program synthesis that combines Genetic Programming (GP) with a frozen Large Language Model (LLM) to tackle problems that require planning and compositional reasoning. Rather than generating programs from scratch, our method evolves candidate solutions using GP and then refines failed programs via LLM-based code edits.
</p>



      <h3 className="text-xl font-semibold mt-8">📄 Paper</h3>
      <a
        href="/evorepair.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        Read the full paper
      </a>
    <img
        src="/exa.png"
        alt="Diagram"
        className="mt-6 rounded-xl border shadow-md"
      />

<p className="mt-4 text-lg leading-relaxed">
  The LLM operates purely through a self-feedback prompting loop and serves as a semantic editor for improving GP-generated programs. The system operates in two stages. <strong>Stage 1:</strong> GP performs evolutionary search over a type-safe Domain-Specific Language (DSL), adopted from prior work, using the Distributed Evolutionary Algorithms in Python (DEAP) framework with strict typing to ensure semantic validity. <strong>Stage 2:</strong> If GP fails to solve the given task, the best candidate program so far is passed to the LLM for repair.
</p>

         <img
        src="/examp.png"
        alt="Diagram"
        className="mt-6 rounded-xl border shadow-md"
      />
            
<p className="mt-4 text-lg leading-relaxed">
  The LLM receives the best program, current input-output examples, and program fitness score, and iteratively suggests edited programs until fitness improves or the retry limit is reached. Although recent methods rely heavily on fine-tuned LLMs, evolutionary approaches remain underexplored—especially in the Abstraction and Reasoning Corpus (ARC) benchmark.
</p>


       <img
        src="/performance.png"
        alt="Diagram"
        className="mt-6 rounded-xl border shadow-md"
      />
      <p className="mt-4 text-lg leading-relaxed">
  We show that a frozen LLM can enhance genetic programming for code refinement. Experiments on ARC reveal performance gains over the GP-only baseline. Our goal is to demonstrate that evolutionary learning methods can be enhanced through LLM-based code editing, forming a neuro-evolutionary pipeline.
</p>
      <h3 className="text-xl font-semibold mt-8">🔖 Citation</h3>
      <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto text-sm">
{`@article{evorepair2025,
  title={EvoRepair: Evolving and Refining Code:A Neuro-Evolutionary Program Synthesis for
 Compositional Reasoning},
  author={Annonymoous},
  year={2025}
}`}
      </pre>
    </main>
  );
}
