import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NotebookPen, Plus, Search, Bookmark, BookmarkCheck,
  Trash2, Edit3, Tag, X, Save, Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Note } from "@/types";
import { getNotes, createNote as apiCreateNote, updateNote, deleteNote as apiDeleteNote } from "@/api/notes";



const NOTE_COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899", "#ef4444", "#06b6d4", "#f97316"];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getNotes()
      .then(setNotes)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [previewing, setPreviewing] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "", tags: "", color: NOTE_COLORS[0] });

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  const filtered = notes.filter(n => {
    const title = n.title || "";
    const content = n.content || "";
    const tags = n.tags || [];
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || content.toLowerCase().includes(search.toLowerCase());
    const matchTag = !filterTag || tags.includes(filterTag);
    const matchBookmark = !showBookmarked || Boolean(n.isBookmarked);
    return matchSearch && matchTag && matchBookmark;
  });

  const createNote = async () => {
    if (!draft.title.trim()) return;
    try {
      const note = await apiCreateNote({
        title: draft.title,
        content: draft.content,
        tags: draft.tags.split(",").map(t => t.trim()).filter(Boolean),
        color: draft.color
      });
      setNotes(prev => [note, ...prev]);
      setDraft({ title: "", content: "", tags: "", color: NOTE_COLORS[0] });
      setIsCreating(false);
    } catch (e) {
      console.error(e);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const updated = await updateNote(editing.id, {
        title: editing.title,
        content: editing.content,
        tags: editing.tags,
      });
      setNotes(prev => prev.map(n => n.id === editing.id ? { ...n, ...updated } : n));
      setEditing(null);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await apiDeleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (editing?.id === id) setEditing(null);
      if (previewing?.id === id) setPreviewing(null);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBookmark = async (id: string) => {
    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      const updated = await updateNote(id, { isBookmarked: !note.isBookmarked });
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updated, isBookmarked: !note.isBookmarked } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>')
      .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="bg-gray-950 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2"><code>$1</code></pre>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm mb-0.5">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm mb-0.5">$1</li>')
      .replace(/\n\n/g, '<br />')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Notes"
        description="Markdown notes with tags and bookmarks"
        icon={<NotebookPen className="h-5 w-5 text-amber-500" />}
        actions={
          <Button variant="gradient" size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="mr-1.5 h-4 w-4" />New Note
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant={showBookmarked ? "default" : "outline"} size="sm"
          onClick={() => setShowBookmarked(v => !v)}>
          <Bookmark className="mr-1.5 h-4 w-4" />Bookmarked
        </Button>
      </div>

      {/* Tag filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterTag(null)}
          className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-all",
            !filterTag ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30")}>
          All
        </button>
        {allTags.map(tag => (
          <button key={tag} onClick={() => setFilterTag(tag === filterTag ? null : tag)}
            className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-all",
              filterTag === tag ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30")}>
            {tag}
          </button>
        ))}
      </div>

      {/* Create note form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-primary/30">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">New Note</h3>
                  <button onClick={() => setIsCreating(false)}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                </div>
                <Input placeholder="Note title..." value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} />
                <Textarea placeholder="Write in Markdown... (## Heading, **bold**, `code`, - list)" rows={8}
                  className="font-mono text-sm" value={draft.content} onChange={e => setDraft(p => ({ ...p, content: e.target.value }))} />
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 flex-1">
                    <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input placeholder="Tags (comma separated)" className="h-8 text-xs"
                      value={draft.tags} onChange={e => setDraft(p => ({ ...p, tags: e.target.value }))} />
                  </div>
                  <div className="flex gap-1.5">
                    {NOTE_COLORS.map(c => (
                      <button key={c} onClick={() => setDraft(p => ({ ...p, color: c }))}
                        className={cn("h-5 w-5 rounded-full border-2 transition-all", draft.color === c ? "border-foreground scale-125" : "border-transparent")}
                        style={{ background: c }} />
                    ))}
                  </div>
                  <Button size="sm" variant="gradient" onClick={createNote}>
                    <Save className="mr-1.5 h-4 w-4" />Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes grid + preview */}
      <div className={cn("grid gap-6", previewing ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
        {/* Notes list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
          <AnimatePresence>
            {filtered.map((note, i) => (
              <motion.div key={note.id}
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.04 }}>
                <Card className={cn("cursor-pointer transition-all hover:shadow-md hover:-translate-y-px border-l-4",
                  previewing?.id === note.id && "ring-2 ring-primary")}
                  style={{ borderLeftColor: note.color || "#3b82f6" }}
                  onClick={() => setPreviewing(previewing?.id === note.id ? null : note)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{note.title}</h3>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={e => { e.stopPropagation(); toggleBookmark(note.id); }}
                          className="p-1 rounded hover:bg-muted transition-colors">
                          {note.isBookmarked ? <BookmarkCheck className="h-3.5 w-3.5 text-violet-500" /> : <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                        <button onClick={e => { e.stopPropagation(); setEditing(note); setPreviewing(null); }}
                          className="p-1 rounded hover:bg-muted transition-colors">
                          <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                          className="p-1 rounded hover:bg-red-500/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                      {(note.content || "").replace(/[#*`]/g, "").trim()}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {(note.tags || []).slice(0, 3).map(t => (
                          <Badge key={t} variant="secondary" className="text-xs h-4 px-1.5">{t}</Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(note.updatedAt || note.createdAt || new Date().toISOString())}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-muted-foreground">
              <NotebookPen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No notes found</p>
              <p className="text-sm mt-1">Create your first note above</p>
            </div>
          )}
        </div>

        {/* Preview / Edit panel */}
        <AnimatePresence>
          {(previewing || editing) && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card className="sticky top-4 h-[calc(100vh-8rem)]">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    {editing ? <Edit3 className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-primary" />}
                    <span className="font-semibold text-sm">{editing ? "Edit Note" : "Preview"}</span>
                  </div>
                  <div className="flex gap-2">
                    {editing && (
                      <Button size="sm" variant="gradient" onClick={saveEdit}>
                        <Save className="mr-1 h-3.5 w-3.5" />Save
                      </Button>
                    )}
                    <button onClick={() => { setEditing(null); setPreviewing(null); }}>
                      <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto h-full">
                  {editing ? (
                    <div className="p-4 space-y-3">
                      <Input value={editing.title} onChange={e => setEditing(p => p ? { ...p, title: e.target.value } : p)}
                        className="font-semibold" placeholder="Title" />
                      <Textarea value={editing.content} onChange={e => setEditing(p => p ? { ...p, content: e.target.value } : p)}
                        className="font-mono text-sm min-h-[400px] resize-none" />
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <Input value={(editing.tags || []).join(", ")} className="h-8 text-xs"
                          onChange={e => setEditing(p => p ? { ...p, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) } : p)} />
                      </div>
                    </div>
                  ) : previewing && (
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-3 w-3 rounded-full" style={{ background: previewing.color || "#3b82f6" }} />
                        <h2 className="font-bold text-lg">{previewing.title}</h2>
                      </div>
                      <div className="flex gap-1 mb-4">
                        {(previewing.tags || []).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                      </div>
                      <div className="prose-custom text-sm"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(previewing.content || "") }} />
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
