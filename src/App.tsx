import { useState, useRef, useEffect } from "react";
import {
  Terminal,
  ChevronRight,
  Copy,
  Check,
  Award,
  Briefcase,
  Mail,
  FileCode,
  Globe,
  Github,
  Sparkles,
  Code2,
  Sliders,
  ArrowRight,
  Plus,
  Trash2,
  Monitor,
  Eye,
  Settings,
  Send,
  RefreshCw,
  GraduationCap,
  Play,
  Download,
  CheckCircle2,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { DEFAULT_PROFILE, NEXT_BOILERPLATE_FILES, BIODATA_CHECKLIST, NEW_ARCHITECTURE_NODES } from "./data";
import { FileTemplate, ChecklistItem, ChatMessage, ArchitectureNode, ProfileInfo } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Profile state for live-customization
  const [profile, setProfile] = useState<ProfileInfo>(DEFAULT_PROFILE);
  const [newSkill, setNewSkill] = useState<string>("");

  // Next.js templates, active selector state
  const [files, setFiles] = useState<FileTemplate[]>(NEXT_BOILERPLATE_FILES);
  const [selectedFileId, setSelectedFileId] = useState<string>("next-page");
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);

  // Tab systems: preview vs assistant chat
  const [leftTab, setLeftTab] = useState<"checklist" | "editor">("editor");
  const [rightPanel, setRightPanel] = useState<"preview" | "assistant">("preview");

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(BIODATA_CHECKLIST);

  // Architecture Pipeline monitoring nodes
  const [nodes, setNodes] = useState<ArchitectureNode[]>(NEW_ARCHITECTURE_NODES);
  const [activeNodeId, setActiveNodeId] = useState<string>("node-user-editor");

  // Gemini assistant console state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-portfolio",
      sender: "ai",
      text: "Hello Manisha! I have initiated the Next.js personal biodata workspace for you. Adjust your details in the editor on the left. The source code on the central explorer and the live visual mockups on the right will update instantaneously as you type! Ask me any questions about unzipping, linking GitHub, or customizing experiences.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat thread
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiLoading]);

  // Method to insert modified profile state into Next.js source code in real-time
  const getRenderedContent = (file: FileTemplate): string => {
    let result = file.content;
    
    // Replace standard placeholders
    result = result.replace(/VAR_FULL_NAME/g, profile.fullName);
    result = result.replace(/VAR_EMAIL/g, profile.email);
    result = result.replace(/VAR_UNIVERSITY/g, profile.university);
    result = result.replace(/VAR_PROGRAM/g, profile.program);
    result = result.replace(/VAR_SPECIALIZATION/g, profile.specialization);
    result = result.replace(/VAR_GRADUATION_YEAR/g, profile.graduationYear);
    result = result.replace(/VAR_BIO/g, profile.bio.replace(/"/g, '\\"'));

    // Inject arrays formatted as valid JSON expressions
    if (file.id === "next-page") {
      result = result.replace("VAR_SKILLS_JSON", JSON.stringify(profile.skills, null, 2));
      result = result.replace("VAR_PROJECTS_JSON", JSON.stringify(profile.projects, null, 2));
      result = result.replace("VAR_EXPERIENCE_JSON", JSON.stringify(profile.experience, null, 2));
    }

    return result;
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFileId(id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleProjectChange = (index: number, field: "title" | "desc" | "tag", val: string) => {
    const updatedProjects = [...profile.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: val };
    setProfile({ ...profile, projects: updatedProjects });
  };

  const handleExperienceChange = (index: number, field: "role" | "organization" | "duration" | "description", val: string) => {
    const updatedExp = [...profile.experience];
    updatedExp[index] = { ...updatedExp[index], [field]: val };
    setProfile({ ...profile, experience: updatedExp });
  };

  const handleToggleStep = (stepId: string) => {
    setChecklist(
      checklist.map((item) => {
        if (item.id === stepId) {
          const updated = !item.isCompleted;
          // Synchronize architecture statuses
          if (stepId === "new-repo") {
            updateNodeState("node-new-github", updated ? "ready" : "pending");
          } else if (stepId === "new-vercel") {
            updateNodeState("node-vercel-cd", updated ? "ready" : "pending");
          } else if (stepId === "new-custom") {
            updateNodeState("node-user-editor", updated ? "active" : "active");
          } else if (stepId === "new-export") {
            updateNodeState("node-nextjs-exporter", updated ? "active" : "ready");
          } else if (stepId === "new-commit") {
            updateNodeState("node-new-github", updated ? "active" : "ready");
          } else if (stepId === "new-live") {
            updateNodeState("node-vercel-cd", updated ? "active" : "pending");
          }
          return { ...item, isCompleted: updated };
        }
        return item;
      })
    );
  };

  const updateNodeState = (nodeId: string, status: "pending" | "ready" | "active") => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => (n.id === nodeId ? { ...n, status } : n))
    );
  };

  // Serve backend AI help
  const handleSendMessage = async (customPrompt?: string | null) => {
    const queryText = customPrompt || userInput;
    if (!queryText.trim() || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setUserInput("");
    setIsAiLoading(true);

    // Auto set panel to assistant so user sees responses
    setRightPanel("assistant");

    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryText,
          context: {
            fullName: profile.fullName,
            university: profile.university,
            program: profile.program,
            specialization: profile.specialization,
            skillsCount: profile.skills.length,
            completedSteps: checklist.filter(c => c.isCompleted).map(c => c.title)
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-ai`,
            sender: "ai",
            text: data.text || "I have received your query. Please let me know how I can further tailor your MBA profile code.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.error || "No response text");
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai-fail`,
          sender: "ai",
          text: `💡 Gemini Offline Tip: If your secret key is currently unconfigured, here is standard guidance:\n\nTo unzip files inside Vercel, note that Vercel performs builds natively using Git hooks! You do not manually unzip files inside Vercel's dashboard. Simply unzip files locally or within GitHub Codespaces, drag/push them to your remote repository on GitHub, and Vercel will instantly detect and compile your raw Next.js codebase.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const SUGGESTIONS = [
    { title: "How to unzip in Codespace?", prompt: "Could you write out the exact CLI commands to unzip our portfolio zip package inside GitHub Codespaces terminal?" },
    { title: "Improve my Bio text", prompt: "I am majoring in MBA Marketing & Strategy at Chandigarh University. Rewrite my biography to sound highly professional, polished, and suitable for marketing internships." },
    { title: "Link repository to Vercel", prompt: "Give me step-by-step instructions to connect my brand-new GitHub repository to my Vercel profile." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans p-3 md:p-6 text-slate-100 flex flex-col justify-between" id="app_root">
      
      {/* Page Header */}
      <header className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-900 backdrop-blur-md" id="app_header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-950/40">
            <GraduationCap className="h-6 w-6 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-white">Manisha Kamal &bull; MBA Biosuite</h1>
              <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider bg-indigo-950/40 text-indigo-400 border border-indigo-500/10 rounded">
                Next.js Code Kit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Preview and live-customize your professional student profile at <span className="text-white font-semibold">Chandigarh University</span>, generate high-quality Next.js configs, and deploy serverlessly on Vercel.
            </p>
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 rounded-lg border border-slate-900 text-xs text-slate-350">
            <Github className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-mono text-zinc-400">Target: New Repository</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/30 text-indigo-400 border border-indigo-400/20 rounded-lg text-xs font-mono">
            <span>Next.js App Router v14+</span>
          </div>
        </div>
      </header>

      {/* Main Grid Content Area */}
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch flex-grow mb-6" id="app_main">
        
        {/* Left Column (xl:col-span-4): Configurator / Checklist Tabs */}
        <section className="xl:col-span-4 flex flex-col gap-5" id="profile_form_section">
          
          <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-2xl flex-grow flex flex-col">
            
            {/* Left Tabs */}
            <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-900 mb-5">
              <button
                onClick={() => setLeftTab("editor")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  leftTab === "editor"
                    ? "bg-indigo-900/40 text-indigo-200 border-b-2 border-indigo-500 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                Customize Biodata
              </button>
              <button
                onClick={() => setLeftTab("checklist")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  leftTab === "checklist"
                    ? "bg-indigo-900/40 text-indigo-200 border-b-2 border-indigo-500 shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Setup Checklist ({checklist.filter(c => c.isCompleted).length}/{checklist.length})
              </button>
            </div>

            {/* Dynamic Content Views */}
            <div className="flex-grow overflow-y-auto pr-1 max-h-[640px] text-left">
              <AnimatePresence mode="wait">
                
                {leftTab === "editor" ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4 text-xs text-slate-300"
                  >
                    {/* Basic info form fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Email Coordinates</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">University</label>
                        <input
                          type="text"
                          value={profile.university}
                          onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Graduation Year</label>
                        <input
                          type="text"
                          value={profile.graduationYear}
                          onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Academic Degree</label>
                        <input
                          type="text"
                          value={profile.program}
                          onChange={(e) => setProfile({ ...profile, program: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Major Specialty</label>
                        <input
                          type="text"
                          value={profile.specialization}
                          onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Biography / Summary Statement</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-slate-350 leading-relaxed text-slate-300"
                      />
                    </div>

                    {/* Skill array customizer */}
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">MBA Core Competencies</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                          placeholder="e.g. Quantitative Market Analysis"
                          className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 text-xs"
                        />
                        <button
                          onClick={handleAddSkill}
                          className="px-3 bg-indigo-900/60 hover:bg-indigo-900 border border-indigo-500/30 font-semibold text-indigo-300 rounded-lg text-xs flex items-center justify-center pr-2.5 transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-950 border border-slate-850 rounded-lg">
                        {profile.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300"
                          >
                            <span>{skill}</span>
                            <button
                              onClick={() => handleRemoveSkill(sIdx)}
                              className="text-red-400 hover:text-red-300 cursor-pointer"
                              title="Delete competent item"
                            >
                              <Plus className="h-3 w-3 rotate-45" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Custom work milestones edit fields */}
                    <div className="pt-2 border-t border-slate-850">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">Corporate Milestones</label>
                        <span className="text-[9px] text-zinc-500 font-mono">Customizable</span>
                      </div>
                      <div className="space-y-3">
                        {profile.experience.map((exp, idx) => (
                          <div key={idx} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={exp.role}
                                onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                                className="w-1/2 bg-slate-900 border border-slate-800/80 rounded px-2 py-1 text-xs text-white hover:border-slate-700"
                                placeholder="Role Title"
                              />
                              <input
                                type="text"
                                value={exp.organization}
                                onChange={(e) => handleExperienceChange(idx, "organization", e.target.value)}
                                className="w-1/2 bg-slate-900 border border-slate-800/80 rounded px-2 py-1 text-xs text-indigo-300 hover:border-slate-700 font-semibold"
                                placeholder="Organization Name"
                              />
                            </div>
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800/80 rounded px-2 py-1 text-[10px] text-slate-400 font-mono"
                              placeholder="Duration"
                            />
                            <textarea
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                              rows={2}
                              className="w-full bg-slate-900 border border-slate-800/80 rounded px-2 py-1 text-[11px] text-slate-400"
                              placeholder="Responsibility detail description..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Academic initiatives study projects fields */}
                    <div className="pt-2 border-t border-slate-850">
                      <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2">Strategic Initiatives</label>
                      <div className="space-y-3">
                        {profile.projects.map((proj, idx) => (
                          <div key={idx} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => handleProjectChange(idx, "title", e.target.value)}
                                className="w-2/3 bg-slate-900 border border-slate-800/80 rounded px-2 py-1 text-xs text-white"
                                placeholder="Project Title"
                              />
                              <input
                                type="text"
                                value={proj.tag}
                                onChange={(e) => handleProjectChange(idx, "tag", e.target.value)}
                                className="w-1/3 bg-slate-900 border border-slate-800/80 rounded px-2 py-1 text-[10px] text-rose-400 text-center font-mono uppercase"
                                placeholder="Focus Tag"
                              />
                            </div>
                            <textarea
                              value={proj.desc}
                              onChange={(e) => handleProjectChange(idx, "desc", e.target.value)}
                              rows={2}
                              className="w-full bg-slate-900 border border-slate-800/80 rounded px-2 py-1 text-[11px] text-slate-400"
                              placeholder="Describe project details..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <motion.div
                    key="checklist"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all ${
                          item.isCompleted
                            ? "bg-indigo-950/5 border-indigo-950 text-slate-450"
                            : "bg-slate-950 border-slate-900 hover:border-slate-850 text-slate-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleStep(item.id)}
                            className={`h-5 w-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              item.isCompleted
                                ? "bg-indigo-600 border-indigo-500 text-white"
                                : "border-slate-700 hover:border-slate-500 text-transparent"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <div className="flex-grow text-left">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{item.step}</span>
                              {item.isCompleted && (
                                <span className="text-[9px] font-bold text-indigo-400 uppercase font-mono">Completed</span>
                              )}
                            </div>
                            <h4 className={`text-xs font-bold mt-0.5 ${item.isCompleted ? "text-slate-500 line-through" : "text-slate-100"}`}>
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Micro pipeline visualization in footer */}
            <div className="mt-4 pt-4 border-t border-slate-900">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-2">
                <span>ENVIRONMENT DEPLOYMENT PIPELINE</span>
                <span>Active Status</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {nodes.map((node) => {
                  const isSelected = activeNodeId === node.id;
                  let dotColor = "bg-slate-700";
                  if (node.status === "active") dotColor = "bg-emerald-400";
                  if (node.status === "ready") dotColor = "bg-indigo-400 animate-pulse";
                  return (
                    <button
                      key={node.id}
                      onClick={() => {
                        setActiveNodeId(node.id);
                        if (node.id === "node-user-editor") setLeftTab("editor");
                        if (node.id === "node-nextjs-exporter") {
                          setLeftTab("editor");
                          setSelectedFileId("next-page");
                        }
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-950/40 border-indigo-500" 
                          : "bg-slate-950 border-slate-900"
                      }`}
                      title={node.description}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
                        <span className="text-[9px] font-mono text-slate-300 truncate tracking-tight">
                          {node.label.split(" ")[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* Center Column (xl:col-span-4): Next.js Live Code Exporter */}
        <section className="xl:col-span-4 flex flex-col gap-6" id="code_exporter_section">
          
          <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-cyan-400" />
                    Next.js Code Packer
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Customized automatically with your edited profile changes</p>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/50 px-2 py-0.5 border border-indigo-500/10 rounded">
                  Src Exporter
                </span>
              </div>

              {/* Next.js files tabs selection */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {files.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  return (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1 border cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-950/50 border-indigo-500 text-indigo-300" 
                          : "bg-slate-950/50 border-slate-900 text-slate-450 hover:text-slate-200 hover:border-slate-800"
                      }`}
                    >
                      <FileCode className="h-3 w-3 shrink-0" />
                      <span>{file.path.split("/").pop()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Target Code Pre-container */}
              <div className="relative">
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 bg-slate-900/80 px-2.5 py-0.5 border border-slate-800 rounded">
                    {files.find(f => f.id === selectedFileId)?.language || "txt"}
                  </span>
                  <button
                    onClick={() => {
                      const targetFile = files.find(f => f.id === selectedFileId);
                      if (targetFile) {
                        handleCopyCode(getRenderedContent(targetFile), targetFile.id);
                      }
                    }}
                    className="p-1 px-2.5 hover:bg-slate-850 text-slate-3 w bg-slate-900 text-white rounded-md border border-slate-800 transition-all flex items-center gap-1 text-[10px] cursor-pointer"
                    title="Copy this verified file block"
                  >
                    {copiedFileId === selectedFileId ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-slate-350" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden">
                  <div className="flex items-center px-4 py-2 bg-slate-900/40 border-b border-slate-900 text-[10px] font-mono text-slate-400">
                    <span className="h-1.5 w-1.5 bg-rose-500 rounded-full mr-1.5"></span>
                    <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full mr-1.5"></span>
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mr-5"></span>
                    <span>{files.find(f => f.id === selectedFileId)?.path}</span>
                  </div>
                  <pre className="p-4 overflow-x-auto max-h-[380px] font-mono text-[11px] text-slate-300 leading-relaxed text-left selection:bg-indigo-500/30">
                    <code>{getRenderedContent(files.find(f => f.id === selectedFileId) || files[0])}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Micro instruction wrapper */}
            <div className="mt-4 p-3 bg-slate-950 border border-slate-855 rounded-xl flex gap-2.5 items-start text-xs">
              <BookOpen className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">File Explanation</span>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  {files.find(f => f.id === selectedFileId)?.description}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Right Column (xl:col-span-4): Live Mockup View & Gemini Side-Console */}
        <section className="xl:col-span-4 flex flex-col gap-6" id="right_preview_section">
          
          <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-2xl flex-grow h-[460px] flex flex-col justify-between">
            <div className="flex flex-col h-full justify-between">
              
              {/* Right panel selectors header */}
              <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    onClick={() => setRightPanel("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                      rightPanel === "preview"
                        ? "bg-indigo-900/40 text-indigo-200 border border-indigo-500/10 shadow-sm"
                        : "text-slate-450 hover:text-slate-200"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Live Website Mockup
                  </button>
                  <button
                    onClick={() => setRightPanel("assistant")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                      rightPanel === "assistant"
                        ? "bg-indigo-900/40 text-indigo-200 border border-indigo-500/10 shadow-sm"
                        : "text-slate-450 hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    Draft Planner (AI)
                  </button>
                </div>

                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              {/* Dynamic panel frames */}
              <div className="flex-grow overflow-y-auto mb-4">
                <AnimatePresence mode="wait">
                  
                  {rightPanel === "preview" ? (
                    <motion.div
                      key="live_preview"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="h-full flex flex-col"
                    >
                      {/* Browser Frame Window shell structure */}
                      <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden flex flex-col h-[340px] shadow-2xl">
                        
                        {/* Mock Address bar */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border-b border-slate-900">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 bg-rose-500 rounded-full"></span>
                            <span className="h-2 w-2 bg-yellow-500 rounded-full"></span>
                            <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
                          </div>
                          <div className="flex-grow bg-slate-950/80 px-3 py-1 rounded-md border border-slate-850 text-[9px] font-mono text-slate-450 text-left flex justify-between items-center max-w-[260px] mx-auto text-slate-500">
                            <span>https://{profile.fullName.toLowerCase().replace(/\s+/g, '-')}.vercel.app</span>
                            <Globe className="h-2.5 w-2.5 text-zinc-500" />
                          </div>
                        </div>

                        {/* Interactive live rendering simulator iframe */}
                        <div className="flex-grow overflow-y-auto bg-slate-950 text-slate-300 p-4 text-xs font-sans text-left space-y-5 select-none scrollbar-thin">
                          
                          {/* Inner Hero block */}
                          <div className="text-center py-6 border-b border-slate-900 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 bg-indigo-500/5 blur-xl"></div>
                            <span className="px-2 py-0.5 bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-mono text-[9px] rounded-full uppercase">
                              MBA Portfolio Trajectory
                            </span>
                            <h2 className="text-lg font-bold text-white mt-2 font-display">{profile.fullName}</h2>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">
                              {profile.program} &bull; {profile.university}
                            </p>
                            <p className="text-[10px] text-indigo-400 mt-0.5">Specialization: {profile.specialization}</p>
                            <p className="text-[10px] text-slate-505 mt-3 max-w-[280px] mx-auto text-slate-400 leading-relaxed italic">
                              "{profile.bio}"
                            </p>
                          </div>

                          {/* Inner academic credentials block */}
                          <div className="space-y-2">
                            <h3 className="text-[10px] uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
                              Academic Institution
                            </h3>
                            <div className="p-2.5 bg-slate-900/40 border border-slate-900 rounded-lg">
                              <h4 className="font-bold text-white text-[11px]">{profile.university}</h4>
                              <p className="text-[9px] text-cyan-400">Master of Business Administration &bull; MBA Specialization</p>
                              <p className="text-[9px] text-slate-400 mt-1 font-mono">Class of {profile.graduationYear}</p>
                            </div>
                          </div>

                          {/* Inner Specialty block */}
                          <div className="space-y-2">
                            <h3 className="text-[10px] uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1">
                              <Award className="h-3.5 w-3.5 text-indigo-400" />
                              Strategic Capabilities
                            </h3>
                            <div className="grid grid-cols-2 gap-1.5">
                              {profile.skills.map((skill, sIdx) => (
                                <div key={sIdx} className="p-1 px-2.5 bg-slate-900/30 border border-slate-900 rounded flex items-center gap-1">
                                  <span className="h-1 w-1 bg-cyan-400 rounded-full shrink-0"></span>
                                  <span className="text-[9px] text-slate-300 truncate">{skill}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Inner experience items */}
                          <div className="space-y-2">
                            <h3 className="text-[10px] uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5 text-violet-400" />
                              Professional Milestones
                            </h3>
                            <div className="space-y-2">
                              {profile.experience.map((exp, idx) => (
                                <div key={idx} className="p-2.5 bg-slate-900/30 border border-slate-900 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <h5 className="font-bold text-white text-[10px]">{exp.role}</h5>
                                    <span className="text-[8px] font-mono text-zinc-500">{exp.duration}</span>
                                  </div>
                                  <p className="text-[9px] text-cyan-400">{exp.organization}</p>
                                  <p className="text-[9px] text-slate-400 mt-1 leading-normal">{exp.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Inner Initiatives block */}
                          <div className="space-y-2">
                            <h3 className="text-[10px] uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5 text-rose-400" />
                              Applied Projects
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {profile.projects.map((proj, pIdx) => (
                                <div key={pIdx} className="p-2 bg-slate-900/30 border border-slate-900 rounded-lg flex flex-col justify-between">
                                  <div>
                                    <span className="text-[7px] uppercase font-mono bg-rose-950 text-rose-400 px-1.5 py-0.5 border border-rose-500/20 rounded">
                                      {proj.tag}
                                    </span>
                                    <h6 className="font-bold text-slate-200 text-[10px] mt-1">{proj.title}</h6>
                                    <p className="text-[8px] text-slate-400 leading-snug mt-1">{proj.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="gemini_assistant"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="h-full flex flex-col justify-between"
                    >
                      {/* Message Thread container */}
                      <div className="h-[210px] overflow-y-auto pr-1 space-y-3 scrollbar-thin text-xs text-left mb-2">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                              <span className={msg.sender === "user" ? "text-cyan-400" : "text-violet-400 font-bold"}>
                                {msg.sender === "user" ? "You" : "Genie Architect"}
                              </span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <div className={`p-2.5 rounded-lg border leading-relaxed ${
                              msg.sender === "user"
                                ? "bg-cyan-950/30 border-cyan-500/10 text-cyan-200 text-left"
                                : "bg-slate-950 border-slate-900 text-slate-350 text-left"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isAiLoading && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                            <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                            <span>Synthesizing structural solution...</span>
                          </div>
                        )}
                        <div ref={chatBottomRef}></div>
                      </div>

                      {/* AI Recommendations */}
                      <div className="mb-2">
                        <span className="text-[9px] font-mono text-zinc-500 tracking-wider block mb-1 uppercase">Recommended Queries</span>
                        <div className="flex flex-col gap-1 text-left">
                          {SUGGESTIONS.map((s, index) => (
                            <button
                              key={index}
                              onClick={() => handleSendMessage(s.prompt)}
                              className="text-[9px] w-full bg-slate-950 hover:bg-slate-850 px-2 py-1 rounded border border-slate-850 text-slate-450 hover:text-slate-200 transition-all text-left truncate cursor-pointer"
                            >
                              + {s.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Small text input box */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                          placeholder="Ask about git/vercel integration..."
                          className="flex-grow bg-slate-950 text-xs text-white border border-slate-850 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 font-mono"
                        />
                        <button
                          onClick={() => handleSendMessage()}
                          disabled={!userInput.trim() || isAiLoading}
                          className="px-2.5 bg-indigo-600 hover:bg-slate-500 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center font-bold"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Section: Quick Start Vercel command guide */}
          <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2.5 items-start text-xs text-left">
              <Terminal className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-200">Preconfigured Zip Package</h4>
                <p className="text-[11px] text-slate-400">Clicking Copy on the center code viewer compiles files in memory instantly. Push this direct Next.js project to deploy serverlessly!</p>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* Styled Footer */}
      <footer className="text-center py-4 border-t border-slate-900 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-2 font-mono">
        <div>
          🌌 Prepared on Cloud Workspace for student profile <span className="text-indigo-400 font-semibold font-sans">{profile.email}</span>
        </div>
        <div>
          Manisha Kamal &copy; {new Date().getFullYear()} • Chandigarh University Portfolio Builder
        </div>
      </footer>

    </div>
  );
}
