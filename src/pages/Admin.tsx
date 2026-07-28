import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePortfolio } from "../context/PortfolioContext";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

type ToastType = "success" | "error";
interface ToastItem {
  id: number;
  type: ToastType;
  text: string;
}

interface BioForm {
  name: string;
  full_name: string;
  title: string;
  description: string;
  about_title: string;
  about_description: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  instagram: string;
}

interface SkillGroup {
  id: string;
  title: string;
  description: string;
  details: string;
  tools: string[];
}

interface ExperienceRow {
  id?: number;
  position: string;
  company: string;
  period: string;
  location: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
}

interface ProjectRow {
  id?: number;
  title: string;
  category: string;
  technologies: string;
  image: string;
  description: string;
  github_url: string;
  live_demo_url: string;
}

const blankBio: BioForm = {
  name: "",
  full_name: "",
  title: "",
  description: "",
  about_title: "",
  about_description: "",
  location: "",
  email: "",
  github: "",
  linkedin: "",
  twitter: "",
  facebook: "",
  instagram: "",
};

const blankExperience: ExperienceRow = {
  position: "",
  company: "",
  period: "",
  location: "",
  description: "",
  responsibilities: [],
  technologies: [],
};

const blankProject: ProjectRow = {
  title: "",
  category: "",
  technologies: "",
  image: "/images/project-1.webp",
  description: "",
  github_url: "",
  live_demo_url: "",
};

const SKILL_EYEBROW: Record<string, string> = {
  develop: "Backend & System",
  design: "Frontend & Security",
};

const inputCls =
  "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors";
const labelCls =
  "block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5";
const cardCls =
  "bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8";
const primaryBtnCls =
  "bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const ghostBtnCls =
  "bg-white text-slate-600 px-6 py-2.5 rounded-lg font-semibold text-sm border border-slate-200 hover:bg-slate-50 transition-colors";
const dangerBtnCls =
  "text-red-600 px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-50 disabled:opacity-50 transition-colors";

function TagEditor({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...tags, value]);
    setDraft("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.length === 0 && (
          <span className="text-xs text-slate-400 italic">None yet</span>
        )}
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full pl-3 pr-1.5 py-1 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(i)}
              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className={inputCls}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder || "Add an item and press Enter"}
        />
        <button
          type="button"
          onClick={addTag}
          className="shrink-0 w-10 h-10 rounded-full border border-dashed border-slate-300 text-slate-500 flex items-center justify-center hover:border-slate-900 hover:text-slate-900 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { href: "#top", label: "Dashboard" },
  { href: "#profile", label: "Profile" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#experiences", label: "Experience" },
];

const Admin = () => {
  const { config, loading, refreshData } = usePortfolio();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = (type: ToastType, text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // The global stylesheet sets `body { overflow: hidden }` for the
  // landing page's scroll-locked intro animation, and only unlocks it
  // via a script tied to that animation. The admin page never runs
  // that script, so without this it's stuck locked and the mouse
  // wheel / scrollbar do nothing here. Unlock it while this page is
  // mounted, and put back whatever it was when leaving.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // ---------------- Profile / Bio ----------------
  const [bioForm, setBioForm] = useState<BioForm>(blankBio);
  const [savingBio, setSavingBio] = useState(false);
  const [profileTab, setProfileTab] = useState<"details" | "social">("details");

  useEffect(() => {
    if (loading || !config) return;
    setBioForm({
      name: config.developer.name || "",
      full_name: config.developer.fullName || "",
      title: config.developer.title || "",
      description: config.developer.description || "",
      about_title: config.about.title || "",
      about_description: config.about.description || "",
      location: config.social.location || "",
      email: config.social.email || "",
      github: config.social.github || "",
      linkedin: config.contact.linkedin || "",
      twitter: config.contact.twitter || "",
      facebook: config.contact.facebook || "",
      instagram: config.contact.instagram || "",
    });
  }, [loading, config]);

  const handleBioField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBioForm({ ...bioForm, [e.target.name]: e.target.value });
  };

  const saveBio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBio(true);
    try {
      const { error } = await supabase
        .from("bio")
        .update({ ...bioForm })
        .eq("id", 1);
      if (error) throw error;
      await refreshData();
      pushToast("success", "Profile saved — live on the site.");
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't save profile."
      );
    } finally {
      setSavingBio(false);
    }
  };

  // ---------------- Skills ----------------
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [savingSkill, setSavingSkill] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !config) return;
    setSkillGroups([
      { id: "develop", ...config.skills.develop },
      { id: "design", ...config.skills.design },
    ]);
  }, [loading, config]);

  const updateSkillGroup = (id: string, patch: Partial<SkillGroup>) => {
    setSkillGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  };

  const saveSkillGroup = async (group: SkillGroup) => {
    setSavingSkill(group.id);
    try {
      const { error } = await supabase
        .from("skills")
        .update({
          title: group.title,
          description: group.description,
          details: group.details,
          tools: group.tools,
        })
        .eq("id", group.id);
      if (error) throw error;
      await refreshData();
      pushToast("success", `"${group.title}" skill group saved.`);
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't save skill group."
      );
    } finally {
      setSavingSkill(null);
    }
  };

  // ---------------- Experience ----------------
  const [experiences, setExperiences] = useState<ExperienceRow[]>([]);
  const [newExperience, setNewExperience] = useState<ExperienceRow | null>(
    null
  );
  const [savingExp, setSavingExp] = useState<number | "new" | null>(null);
  const [deletingExpId, setDeletingExpId] = useState<number | null>(null);

  useEffect(() => {
    if (loading || !config) return;
    setExperiences(
      config.experiences.map((exp: any) => ({
        id: exp.id,
        position: exp.position || "",
        company: exp.company || "",
        period: exp.period || "",
        location: exp.location || "",
        description: exp.description || "",
        responsibilities: exp.responsibilities || [],
        technologies: exp.technologies || [],
      }))
    );
  }, [loading, config]);

  const updateExperience = (id: number, patch: Partial<ExperienceRow>) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...patch } : exp))
    );
  };

  const saveExperience = async (exp: ExperienceRow) => {
    if (exp.id === undefined) return;
    setSavingExp(exp.id);
    try {
      const { error } = await supabase
        .from("experiences")
        .update({
          position: exp.position,
          company: exp.company,
          period: exp.period,
          location: exp.location,
          description: exp.description,
          responsibilities: exp.responsibilities,
          technologies: exp.technologies,
        })
        .eq("id", exp.id);
      if (error) throw error;
      await refreshData();
      pushToast("success", "Experience saved.");
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't save experience."
      );
    } finally {
      setSavingExp(null);
    }
  };

  const deleteExperience = async (id?: number) => {
    if (id === undefined) return;
    if (!window.confirm("Delete this experience? This can't be undone.")) return;
    setDeletingExpId(id);
    try {
      const { error } = await supabase.from("experiences").delete().eq("id", id);
      if (error) throw error;
      await refreshData();
      pushToast("success", "Experience deleted.");
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't delete experience."
      );
    } finally {
      setDeletingExpId(null);
    }
  };

  const addExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExperience) return;
    setSavingExp("new");
    try {
      const { error } = await supabase
        .from("experiences")
        .insert([{ ...newExperience }]);
      if (error) throw error;
      await refreshData();
      setNewExperience(null);
      pushToast("success", "Experience added.");
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't add experience."
      );
    } finally {
      setSavingExp(null);
    }
  };

  // ---------------- Projects ----------------
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [newProject, setNewProject] = useState<ProjectRow | null>(null);
  const [savingProject, setSavingProject] = useState<number | "new" | null>(
    null
  );
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (loading || !config) return;
    setProjects(
      config.projects.map((p: any) => ({
        id: p.id,
        title: p.title || "",
        category: p.category || "",
        technologies: p.technologies || "",
        image: p.image || "",
        description: p.description || "",
        github_url: p.github_url || "",
        live_demo_url: p.live_demo_url || "",
      }))
    );
  }, [loading, config]);

  const updateProject = (id: number, patch: Partial<ProjectRow>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const saveProject = async (project: ProjectRow) => {
    if (project.id === undefined) return;
    setSavingProject(project.id);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: project.title,
          category: project.category,
          technologies: project.technologies,
          image: project.image,
          description: project.description,
          github_url: project.github_url,
          live_demo_url: project.live_demo_url,
        })
        .eq("id", project.id);
      if (error) throw error;
      await refreshData();
      pushToast("success", `"${project.title}" saved.`);
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't save project."
      );
    } finally {
      setSavingProject(null);
    }
  };

  const deleteProject = async (id?: number) => {
    if (id === undefined) return;
    if (!window.confirm("Delete this project? This can't be undone.")) return;
    setDeletingProjectId(id);
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      await refreshData();
      pushToast("success", "Project deleted.");
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't delete project."
      );
    } finally {
      setDeletingProjectId(null);
    }
  };

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject) return;
    setSavingProject("new");
    try {
      const { error } = await supabase.from("projects").insert([{ ...newProject }]);
      if (error) throw error;
      await refreshData();
      setNewProject(null);
      pushToast("success", "Project added.");
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't add project."
      );
    } finally {
      setSavingProject(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Loading admin data…
      </div>
    );
  }

  return (
    <div id="top" className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen w-[260px] sticky top-0 bg-white border-r border-slate-200 py-6 px-4 shrink-0">
        <div className="mb-8 px-3">
          <h1 className="font-bold text-slate-900 text-lg leading-tight">
            Developer Portfolio
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Admin CMS</p>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                i === 0
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-200 pt-4 px-3 space-y-3">
          {user?.email && (
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-left text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 px-6 md:px-10 py-4 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-slate-900/5 text-slate-600 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Hidden route
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Admin CMS</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Edit portfolio content — changes save straight to Supabase and go
              live immediately.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className={ghostBtnCls}
            >
              View site ↗
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className={`lg:hidden ${dangerBtnCls}`}
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="max-w-[1100px] mx-auto p-6 md:p-10 space-y-12">
          {/* Profile */}
          <section id="profile" className="space-y-4 scroll-mt-24">
            <div className={cardCls}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  {bioForm.full_name || bioForm.name || "Profile"}
                </h2>
                <div className="flex gap-6 border-b border-slate-200 -mb-px">
                  {(["details", "social"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setProfileTab(tab)}
                      className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
                        profileTab === tab
                          ? "border-slate-900 text-slate-900"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {tab === "details" ? "Profile Details" : "Social Links"}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={saveBio}>
                {profileTab === "details" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Name</label>
                        <input
                          className={inputCls}
                          type="text"
                          name="name"
                          value={bioForm.name}
                          onChange={handleBioField}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Full name</label>
                        <input
                          className={inputCls}
                          type="text"
                          name="full_name"
                          value={bioForm.full_name}
                          onChange={handleBioField}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Title</label>
                        <input
                          className={inputCls}
                          type="text"
                          name="title"
                          value={bioForm.title}
                          onChange={handleBioField}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelCls}>About title</label>
                        <input
                          className={inputCls}
                          type="text"
                          name="about_title"
                          value={bioForm.about_title}
                          onChange={handleBioField}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Location</label>
                        <input
                          className={inputCls}
                          type="text"
                          name="location"
                          value={bioForm.location}
                          onChange={handleBioField}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Hook</label>
                        <textarea
                          className={`${inputCls} resize-none`}
                          name="description"
                          rows={4}
                          value={bioForm.description}
                          onChange={handleBioField}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelCls}>About description</label>
                        <textarea
                          className={`${inputCls} resize-none`}
                          name="about_description"
                          rows={6}
                          value={bioForm.about_description}
                          onChange={handleBioField}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === "social" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Email</label>
                        <input
                          className={inputCls}
                          type="email"
                          name="email"
                          value={bioForm.email}
                          onChange={handleBioField}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>GitHub username</label>
                        <input
                          className={inputCls}
                          type="text"
                          name="github"
                          value={bioForm.github}
                          onChange={handleBioField}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>LinkedIn URL</label>
                        <input
                          className={inputCls}
                          type="url"
                          name="linkedin"
                          value={bioForm.linkedin}
                          onChange={handleBioField}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Twitter / X URL</label>
                        <input
                          className={inputCls}
                          type="url"
                          name="twitter"
                          value={bioForm.twitter}
                          onChange={handleBioField}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Facebook URL</label>
                        <input
                          className={inputCls}
                          type="url"
                          name="facebook"
                          value={bioForm.facebook}
                          onChange={handleBioField}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Instagram URL</label>
                        <input
                          className={inputCls}
                          type="url"
                          name="instagram"
                          value={bioForm.instagram}
                          onChange={handleBioField}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button type="submit" disabled={savingBio} className={primaryBtnCls}>
                    {savingBio ? "Saving…" : "Save profile"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Skills */}
          <section id="skills" className="space-y-4 scroll-mt-24">
            <h2 className="text-lg font-bold text-slate-900">Skills Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillGroups.map((group) => (
                <div key={group.id} className={`${cardCls} flex flex-col`}>
                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {SKILL_EYEBROW[group.id] || "Skill Group"}
                    </span>
                    <input
                      className="w-full text-lg font-bold text-slate-900 bg-transparent border-none p-0 mt-0.5 focus:outline-none focus:ring-0"
                      type="text"
                      value={group.title}
                      onChange={(e) =>
                        updateSkillGroup(group.id, { title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <label className={labelCls}>Description</label>
                      <input
                        className={inputCls}
                        type="text"
                        value={group.description}
                        onChange={(e) =>
                          updateSkillGroup(group.id, { description: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Details</label>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={4}
                        value={group.details}
                        onChange={(e) =>
                          updateSkillGroup(group.id, { details: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Skills / tools</label>
                      <TagEditor
                        tags={group.tools}
                        onChange={(tools) => updateSkillGroup(group.id, { tools })}
                        placeholder="e.g. PostgreSQL"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`${primaryBtnCls} mt-6 w-full`}
                    disabled={savingSkill === group.id}
                    onClick={() => saveSkillGroup(group)}
                  >
                    {savingSkill === group.id ? "Saving…" : `Save ${group.id} skill`}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              The public "What I Do" section is built for exactly these two
              groups, so new groups can't be added here without a matching
              redesign of that section.
            </p>
          </section>

          {/* Projects */}
          <section id="projects" className="space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Projects Showcase</h2>
              {!newProject && (
                <button
                  type="button"
                  className={ghostBtnCls}
                  onClick={() => setNewProject(blankProject)}
                >
                  + Add project
                </button>
              )}
            </div>

            {newProject && (
              <form onSubmit={addProject} className={`${cardCls} space-y-4`}>
                <h3 className="font-bold text-slate-900">New project</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Title</label>
                    <input
                      className={inputCls}
                      type="text"
                      value={newProject.title}
                      onChange={(e) =>
                        setNewProject({ ...newProject, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <input
                      className={inputCls}
                      type="text"
                      value={newProject.category}
                      onChange={(e) =>
                        setNewProject({ ...newProject, category: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Technologies</label>
                  <input
                    className={inputCls}
                    type="text"
                    value={newProject.technologies}
                    onChange={(e) =>
                      setNewProject({ ...newProject, technologies: e.target.value })
                    }
                    placeholder="Comma-separated, e.g. React, Supabase, Vite"
                  />
                </div>
                <div>
                  <label className={labelCls}>Image path or URL</label>
                  <input
                    className={inputCls}
                    type="text"
                    value={newProject.image}
                    onChange={(e) =>
                      setNewProject({ ...newProject, image: e.target.value })
                    }
                    placeholder="/images/project-1.webp"
                  />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>GitHub URL</label>
                    <input
                      className={inputCls}
                      type="url"
                      value={newProject.github_url}
                      onChange={(e) =>
                        setNewProject({ ...newProject, github_url: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Live demo URL</label>
                    <input
                      className={inputCls}
                      type="url"
                      value={newProject.live_demo_url}
                      onChange={(e) =>
                        setNewProject({ ...newProject, live_demo_url: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    className={ghostBtnCls}
                    onClick={() => setNewProject(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={primaryBtnCls} disabled={savingProject === "new"}>
                    {savingProject === "new" ? "Adding…" : "Add project"}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div key={project.id} className={`${cardCls} space-y-4`}>
                  <div className="rounded-lg overflow-hidden bg-slate-100 h-40 border border-slate-200">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Title</label>
                      <input
                        className={`${inputCls} font-bold`}
                        type="text"
                        value={project.title}
                        onChange={(e) =>
                          updateProject(project.id as number, { title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Category</label>
                      <input
                        className={inputCls}
                        type="text"
                        value={project.category}
                        onChange={(e) =>
                          updateProject(project.id as number, { category: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Technologies</label>
                    <input
                      className={inputCls}
                      type="text"
                      value={project.technologies}
                      onChange={(e) =>
                        updateProject(project.id as number, { technologies: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Image path or URL</label>
                    <input
                      className={inputCls}
                      type="text"
                      value={project.image}
                      onChange={(e) =>
                        updateProject(project.id as number, { image: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>GitHub URL</label>
                      <input
                        className={inputCls}
                        type="url"
                        value={project.github_url}
                        onChange={(e) =>
                          updateProject(project.id as number, { github_url: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Live demo URL</label>
                      <input
                        className={inputCls}
                        type="url"
                        value={project.live_demo_url}
                        onChange={(e) =>
                          updateProject(project.id as number, { live_demo_url: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={3}
                      value={project.description}
                      onChange={(e) =>
                        updateProject(project.id as number, { description: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      className={dangerBtnCls}
                      disabled={deletingProjectId === project.id}
                      onClick={() => deleteProject(project.id)}
                    >
                      {deletingProjectId === project.id ? "Deleting…" : "Delete"}
                    </button>
                    <button
                      type="button"
                      className={primaryBtnCls}
                      disabled={savingProject === project.id}
                      onClick={() => saveProject(project)}
                    >
                      {savingProject === project.id ? "Saving…" : "Save project"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Experiences */}
          <section id="experiences" className="space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Experience</h2>
              {!newExperience && (
                <button
                  type="button"
                  className={ghostBtnCls}
                  onClick={() => setNewExperience(blankExperience)}
                >
                  + Add experience
                </button>
              )}
            </div>

            {newExperience && (
              <form onSubmit={addExperience} className={`${cardCls} space-y-4`}>
                <h3 className="font-bold text-slate-900">New experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Position</label>
                    <input
                      className={inputCls}
                      type="text"
                      value={newExperience.position}
                      onChange={(e) =>
                        setNewExperience({ ...newExperience, position: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Company / project</label>
                    <input
                      className={inputCls}
                      type="text"
                      value={newExperience.company}
                      onChange={(e) =>
                        setNewExperience({ ...newExperience, company: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Period</label>
                    <input
                      className={inputCls}
                      type="text"
                      value={newExperience.period}
                      onChange={(e) =>
                        setNewExperience({ ...newExperience, period: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Location</label>
                    <input
                      className={inputCls}
                      type="text"
                      value={newExperience.location}
                      onChange={(e) =>
                        setNewExperience({ ...newExperience, location: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    value={newExperience.description}
                    onChange={(e) =>
                      setNewExperience({ ...newExperience, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Responsibilities</label>
                  <TagEditor
                    tags={newExperience.responsibilities}
                    onChange={(responsibilities) =>
                      setNewExperience({ ...newExperience, responsibilities })
                    }
                    placeholder="Add a responsibility"
                  />
                </div>
                <div>
                  <label className={labelCls}>Technologies</label>
                  <TagEditor
                    tags={newExperience.technologies}
                    onChange={(technologies) =>
                      setNewExperience({ ...newExperience, technologies })
                    }
                    placeholder="e.g. React"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    className={ghostBtnCls}
                    onClick={() => setNewExperience(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={primaryBtnCls} disabled={savingExp === "new"}>
                    {savingExp === "new" ? "Adding…" : "Add experience"}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experiences.map((exp) => (
                <div key={exp.id} className={`${cardCls} space-y-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Position</label>
                      <input
                        className={`${inputCls} font-bold`}
                        type="text"
                        value={exp.position}
                        onChange={(e) =>
                          updateExperience(exp.id as number, { position: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Company / project</label>
                      <input
                        className={inputCls}
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(exp.id as number, { company: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Period</label>
                      <input
                        className={inputCls}
                        type="text"
                        value={exp.period}
                        onChange={(e) =>
                          updateExperience(exp.id as number, { period: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Location</label>
                      <input
                        className={inputCls}
                        type="text"
                        value={exp.location}
                        onChange={(e) =>
                          updateExperience(exp.id as number, { location: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={3}
                      value={exp.description}
                      onChange={(e) =>
                        updateExperience(exp.id as number, { description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Responsibilities</label>
                    <TagEditor
                      tags={exp.responsibilities}
                      onChange={(responsibilities) =>
                        updateExperience(exp.id as number, { responsibilities })
                      }
                      placeholder="Add a responsibility"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Technologies</label>
                    <TagEditor
                      tags={exp.technologies}
                      onChange={(technologies) =>
                        updateExperience(exp.id as number, { technologies })
                      }
                      placeholder="e.g. React"
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      className={dangerBtnCls}
                      disabled={deletingExpId === exp.id}
                      onClick={() => deleteExperience(exp.id)}
                    >
                      {deletingExpId === exp.id ? "Deleting…" : "Delete"}
                    </button>
                    <button
                      type="button"
                      className={primaryBtnCls}
                      disabled={savingExp === exp.id}
                      onClick={() => saveExperience(exp)}
                    >
                      {savingExp === exp.id ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-6 border-t border-slate-200 flex flex-wrap justify-between items-center text-xs text-slate-400">
            <p>© 2026 Rushaan Shahid. All rights reserved.</p>
          </footer>
        </div>
      </main>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white flex items-center gap-2 ${
              t.type === "success" ? "bg-slate-900" : "bg-red-600"
            }`}
          >
            <span>{t.type === "success" ? "✓" : "!"}</span>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
