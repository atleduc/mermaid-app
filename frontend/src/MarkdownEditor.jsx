import { useState, useEffect } from "react";
import { marked } from "marked";
import mermaid from "mermaid";

const API_URL = "http://localhost:5000";

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState(
    "# Hello Markdown\n```mermaid\ngraph TD; A-->B; B-->C; C-->D;\n```"
  );
  const [filename, setFilename] = useState("document.md");

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    setTimeout(() => {
      mermaid.init(undefined, document.querySelectorAll(".language-mermaid"));
    }, 100);
  }, [markdown]);

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const saveMarkdown = async () => {
    await fetch(`${API_URL}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, content: markdown }),
    });
    alert("Fichier sauvegardé !");
  };

  const loadMarkdown = async () => {
    const response = await fetch(`${API_URL}/load/${filename}`);
    if (!response.ok) {
      alert("Fichier introuvable");
      return;
    }
    const data = await response.json();
    setMarkdown(data.content);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Markdown & Mermaid Editor</h1>
      <div className="flex flex-row">
        <input
          type="text"
          className="p-2 border rounded w-full mb-2"
          placeholder="Nom du fichier"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
        <div className="flex gap-2 mt-2">
          <button
            className="p-2 bg-blue-500 rounded"
            onClick={downloadMarkdown}
          >
            Télécharger Markdown
          </button>
          <button className="p-2 bg-green-500 rounded" onClick={saveMarkdown}>
            Sauvegarder
          </button>
          <button className="p-2 bg-gray-500  rounded" onClick={loadMarkdown}>
            Charger
          </button>
        </div>
      </div>
      <div className="flex flex-row">
        <textarea
          className="basis-1/3 mt-4 p-2 border rounded"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
        <div
          className="basis-2/3 mt-4 p-4 border rounded bg-gray-100"
          dangerouslySetInnerHTML={{ __html: marked(markdown) }}
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;
