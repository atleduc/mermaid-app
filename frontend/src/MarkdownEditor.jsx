import { useState, useEffect } from "react";
import { marked } from "marked";
import { FaFileArrowDown, FaImage, FaFloppyDisk, FaRetweet, FaRectangleList, FaArrowsToCircle, FaArrowsUpDownLeftRight   } from "react-icons/fa6";
import mermaid from "mermaid";

const API_URL = "http://localhost:1234";

const MarkdownEditor = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }; 
  const [markdown, setMarkdown] = useState(
    "# Hello Markdown\n```mermaid\ngraph TD; A-->B; B-->C; C-->D;\n```"
  );
  const [filename, setFilename] = useState("document.md");
  const [fileList, setFileList] = useState(["document.md"]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    setTimeout(() => {
      mermaid.init(undefined, document.querySelectorAll(".language-mermaid"));
    }, 100);
  }, [markdown]);

  useEffect(() => {
  listDir();
  }, []);
  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const saveMarkdown = async () => {
    try {
      const response= await fetch(`${API_URL}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, content: markdown }),
      });
      if (!response.ok) throw new Error("Erreur serveur");
      alert("Fichier sauvegardé !");
    } catch (error) {
    console.error("Erreur lors de la sauvegarde : "+ `${API_URL}/save`, error);
    alert("Impossible de sauvegarder.");
  }
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

  const listDir = async () => {
    const response = await fetch(`${API_URL}/dir/list`);
    if (!response.ok) {
      alert("Fichier introuvable");
      return;
    }
    const data = await response.json();
    console.log(data);
    setFileList(data.content);
  };
  const downloadMermaidSvg = () => {
  const svgElement = document.querySelector(".language-mermaid svg");
  if (!svgElement) {
    alert("Graph Mermaid non trouvé !");
    return;
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = "diagramme-mermaid.svg";
  link.href = url;
  link.click();
};

  return (
    <div>
       <div className="flex flex-row justify-between">
      <h1 className="text-4xl font-bold mb-4">Markdown & Mermaid Editor</h1>
      <button
        className=" p-2 bg-gray-500  rounded mb-2"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <FaArrowsToCircle />  : <FaArrowsUpDownLeftRight />}
      </button>
      </div>
      <div className="flex flex-row">
        <select
          className="p-2 border rounded"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          onClick={(e) => listDir()}
        >
        {fileList.map((file) => (
          <option key={file} value={file}>
            {file}
          </option>
        ))}
        </select>
        <input
          type="text"
          className="p-2 border rounded w-full"
          placeholder="Nom du fichier"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
        <div className="flex gap-2 ">
          <button
            className="p-2 bg-blue-500 rounded"
            onClick={downloadMarkdown}
          >
            <FaFileArrowDown />
          </button>
          <button className="p-2 bg-green-500 rounded" onClick={saveMarkdown}>
            <FaFloppyDisk />
          </button>
          <button className="p-2 bg-gray-500  rounded" onClick={loadMarkdown}>
            <FaRetweet ></FaRetweet>
          </button>
          <button className="p-2 bg-gray-500  rounded" onClick={listDir}>
            <FaRectangleList />
          </button>
          <button className="p-2 bg-purple-500 rounded" onClick={downloadMermaidSvg} alt="Download svg">
            <FaImage />
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
