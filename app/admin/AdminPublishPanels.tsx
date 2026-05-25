"use client";

import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/Badge";

type PostType = "opportunity" | "guidance";
type Visibility = "draft" | "published" | "scheduled";

type ComposerState = {
  type: PostType | null;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  amount: string;
  deadline: string;
  readTime: string;
  tags: string;
  featured: boolean;
  visibility: Visibility;
  images: File[];
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/30"
        placeholder={placeholder}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-32 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/30"
        placeholder={placeholder}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-left transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    >
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
      <span
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-zinc-950 dark:bg-white" : "bg-zinc-300 dark:bg-white/20"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-5" : "left-0.5"
          } dark:bg-zinc-950`}
        />
      </span>
    </button>
  );
}

function ImageUploader({
  files,
  onFilesChange,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);

  useEffect(() => {
    const next = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(next);

    return () => {
      next.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = Array.from(incoming).filter((file) =>
      file.type.startsWith("image/"),
    );
    onFilesChange([...files, ...next].slice(0, 6));
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Images
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Up to 6 images
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-2xl border border-dashed border-black/15 bg-black/[0.02] px-4 py-4 text-sm text-zinc-600 transition hover:bg-black/[0.04] dark:border-white/15 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
      >
        Click to add images
      </button>

      {previews.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((preview, index) => (
            <div
              key={`${preview.file.name}-${index}`}
              className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10"
            >
              <img
                src={preview.url}
                alt={preview.file.name}
                className="h-32 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    {preview.file.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onFilesChange(files.filter((_, i) => i !== index))
                  }
                  className="text-xs font-medium text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TypeCard({
  title,
  description,
  badge,
  onSelect,
}: {
  title: string;
  description: string;
  badge: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-3xl border border-black/10 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-zinc-950/70"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
          {title}
        </h3>
        <Badge tone="primary">{badge}</Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </button>
  );
}

function ComposerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [state, setState] = useState<ComposerState>({
    type: null,
    title: "",
    category: "",
    excerpt: "",
    body: "",
    amount: "",
    deadline: "",
    readTime: "",
    tags: "",
    featured: false,
    visibility: "draft",
    images: [],
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const resetComposer = () => {
    setState({
      type: null,
      title: "",
      category: "",
      excerpt: "",
      body: "",
      amount: "",
      deadline: "",
      readTime: "",
      tags: "",
      featured: false,
      visibility: "draft",
      images: [],
    });
    onClose();
  };

  const publishLabel =
    state.type === "opportunity" ? "Publish opportunity" : "Publish guidance";

  const handleSaveDraft = () => {
    console.log("Save draft:", state);
    resetComposer();
  };

  const handlePublish = () => {
    console.log("Publish:", state);
    resetComposer();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-6">
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-950 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]">
          <div className="flex items-start justify-between gap-4 border-b border-black/5 p-5 dark:border-white/10">
            <div>
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Create content
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {state.type ? "New post" : "Choose post type"}
              </h2>
            </div>
            <button
              type="button"
              onClick={resetComposer}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
            >
              Close
            </button>
          </div>

          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
            {!state.type ? (
              <div className="grid gap-4 p-5 md:grid-cols-2">
                <TypeCard
                  title="New opportunity"
                  badge="Admin only"
                  description="Create a listing with an amount, deadline, and supporting images."
                  onSelect={() =>
                    setState((prev) => ({ ...prev, type: "opportunity" }))
                  }
                />
                <TypeCard
                  title="Guidance"
                  badge="Resources"
                  description="Publish a helpful post with a readable body, excerpt, and images."
                  onSelect={() =>
                    setState((prev) => ({ ...prev, type: "guidance" }))
                  }
                />
              </div>
            ) : (
              <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="grid gap-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Title"
                      value={state.title}
                      onChange={(value) =>
                        setState((prev) => ({ ...prev, title: value }))
                      }
                      placeholder={
                        state.type === "opportunity"
                          ? "Opportunity title"
                          : "Guidance title"
                      }
                    />
                    <Field
                      label="Category"
                      value={state.category}
                      onChange={(value) =>
                        setState((prev) => ({ ...prev, category: value }))
                      }
                      placeholder="Category"
                    />
                  </div>

                  <TextArea
                    label={state.type === "opportunity" ? "Summary" : "Excerpt"}
                    value={state.excerpt}
                    onChange={(value) =>
                      setState((prev) => ({ ...prev, excerpt: value }))
                    }
                    placeholder={
                      state.type === "opportunity"
                        ? "Short summary of the opportunity"
                        : "Short excerpt for the guidance post"
                    }
                  />

                  <TextArea
                    label={state.type === "opportunity" ? "Details" : "Guidance body"}
                    value={state.body}
                    onChange={(value) =>
                      setState((prev) => ({ ...prev, body: value }))
                    }
                    placeholder={
                      state.type === "opportunity"
                        ? "Describe the opportunity, expectations, and notes"
                        : "Write the full guidance article here"
                    }
                  />

                  <ImageUploader
                    files={state.images}
                    onFilesChange={(files) =>
                      setState((prev) => ({ ...prev, images: files }))
                    }
                  />

                  <Field
                    label="Tags"
                    value={state.tags}
                    onChange={(value) =>
                      setState((prev) => ({ ...prev, tags: value }))
                    }
                    placeholder="e.g. design, remote, featured"
                  />
                </div>

                <div className="grid content-start gap-4 rounded-3xl border border-black/5 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                  {state.type === "opportunity" ? (
                    <>
                      <Field
                        label="Amount"
                        value={state.amount}
                        onChange={(value) =>
                          setState((prev) => ({ ...prev, amount: value }))
                        }
                        placeholder="Amount"
                      />
                      <Field
                        label="Deadline"
                        value={state.deadline}
                        onChange={(value) =>
                          setState((prev) => ({ ...prev, deadline: value }))
                        }
                        placeholder="YYYY-MM-DD"
                        type="date"
                      />
                    </>
                  ) : (
                    <>
                      <Field
                        label="Read time"
                        value={state.readTime}
                        onChange={(value) =>
                          setState((prev) => ({ ...prev, readTime: value }))
                        }
                        placeholder="e.g. 4 min read"
                      />
                      <Field
                        label="Deadline / publish date"
                        value={state.deadline}
                        onChange={(value) =>
                          setState((prev) => ({ ...prev, deadline: value }))
                        }
                        placeholder="YYYY-MM-DD"
                        type="date"
                      />
                    </>
                  )}

                  <div className="grid gap-3">
                    <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Visibility
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {(["draft", "scheduled", "published"] as const).map(
                        (item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                visibility: item,
                              }))
                            }
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              state.visibility === item
                                ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                                : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-white/5"
                            }`}
                          >
                            {item}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <Toggle
                    label="Featured post"
                    checked={state.featured}
                    onChange={(value) =>
                      setState((prev) => ({ ...prev, featured: value }))
                    }
                  />

                  <div className="rounded-2xl border border-black/5 bg-white p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
                    <div className="font-medium text-zinc-950 dark:text-white">
                      Quick tips
                    </div>
                    <p className="mt-1 leading-6">
                      Keep the title clear, use 1–3 tags, and add at least one
                      image for posts that need more context.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {state.type ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 p-5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, type: null }))}
                className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
              >
                Back
              </button>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  {publishLabel}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AdminPublishPanels() {
  const [open, setOpen] = useState(false);

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950/60 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Badge tone="primary">Content studio</Badge>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Create and publish posts
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Start with one button, then choose whether you are creating a new
              opportunity or a guidance post. Add images, tags, and visibility
              settings in one flow.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            Create new post
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="text-sm font-medium text-zinc-950 dark:text-white">
              Step 1
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Click create and choose the post type.
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="text-sm font-medium text-zinc-950 dark:text-white">
              Step 2
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Fill in the content, images, and metadata.
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="text-sm font-medium text-zinc-950 dark:text-white">
              Step 3
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Save as draft, schedule, or publish.
            </p>
          </div>
        </div>
      </div>

      <ComposerModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}