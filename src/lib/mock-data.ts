export const mockUser = {
  id: "user_1",
  name: "Madara Uchiha",
  email: "sorrid01@gmail.com",
  image: null,
  isPro: false,
};

export const mockItemTypes = [
  {
    id: "type_snippet",
    name: "snippet",
    icon: "Code",
    color: "#3b82f6",
    isSystem: true,
  },
  {
    id: "type_prompt",
    name: "prompt",
    icon: "Sparkles",
    color: "#8b5cf6",
    isSystem: true,
  },
  {
    id: "type_command",
    name: "command",
    icon: "Terminal",
    color: "#f97316",
    isSystem: true,
  },
  {
    id: "type_note",
    name: "note",
    icon: "StickyNote",
    color: "#fde047",
    isSystem: true,
  },
  {
    id: "type_link",
    name: "link",
    icon: "Link",
    color: "#10b981",
    isSystem: true,
  },
  {
    id: "type_file",
    name: "file",
    icon: "File",
    color: "#6b7280",
    isSystem: true,
  },
  {
    id: "type_image",
    name: "image",
    icon: "Image",
    color: "#ec4899",
    isSystem: true,
  },
];

export const mockCollections = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Components, components & components",
    isFavorite: false,
    defaultTypeId: "type_snippet",
    itemCount: 4,
  },
  {
    id: "col_2",
    name: "AI Prompts",
    description: "System messages & prompt templates",
    isFavorite: true,
    defaultTypeId: "type_prompt",
    itemCount: 3,
  },
  {
    id: "col_3",
    name: "Python Snippets",
    description: "Data, utils, notes, utilities",
    isFavorite: false,
    defaultTypeId: "type_snippet",
    itemCount: 2,
  },
  {
    id: "col_4",
    name: "DevOps Commands",
    description: "Docker, kubectl, git",
    isFavorite: false,
    defaultTypeId: "type_command",
    itemCount: 3,
  },
  {
    id: "col_5",
    name: "Interview Prep",
    description: "Algorithms & system design notes",
    isFavorite: false,
    defaultTypeId: "type_snippet",
    itemCount: 6,
  },
  {
    id: "col_6",
    name: "Reading List",
    description: "Articles & docs to read",
    isFavorite: false,
    defaultTypeId: "type_link",
    itemCount: 5,
  },
];

export const mockItems = [
  {
    id: "item_1",
    title: "useDebounce hook",
    description: "Debounce any value with configurable delay",
    contentType: "text",
    content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`,
    language: "typescript",
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_snippet",
    tags: ["hooks", "react", "typescript"],
    collectionIds: ["col_1"],
    lastUsedAt: "2026-04-22T10:00:00Z",
  },
  {
    id: "item_2",
    title: "Senior code reviewer",
    description:
      "Acts as a senior engineer reviewing PRs for correctness and style",
    contentType: "text",
    content: `You are a senior software engineer conducting a thorough code review.
Review the provided code for: correctness, performance, security, readability, and adherence to best practices.
Be specific, cite line numbers, and suggest improvements with code examples.`,
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_prompt",
    tags: ["code-review", "engineering"],
    collectionIds: ["col_2"],
    lastUsedAt: "2026-04-22T09:30:00Z",
  },
  {
    id: "item_3",
    title: "Reset local main to origin",
    description: "Hard reset local main branch to match remote",
    contentType: "text",
    content:
      "git fetch origin && git checkout main && git reset --hard origin/main",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tags: ["git"],
    collectionIds: ["col_4"],
    lastUsedAt: "2026-04-22T09:00:00Z",
  },
  {
    id: "item_4",
    title: "Render port checker",
    description: "Check which process is using a port",
    contentType: "text",
    content: "lsof -i :[port] | grep LISTEN",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tags: ["networking", "debug"],
    collectionIds: ["col_4"],
    lastUsedAt: "2026-04-21T18:00:00Z",
  },
  {
    id: "item_5",
    title: "TailBack Router docs",
    description: "Multi-stage builds for Node apps",
    contentType: "url",
    content: null,
    url: "https://example.com/tailback-router",
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_link",
    tags: ["docs"],
    collectionIds: ["col_6"],
    lastUsedAt: "2026-04-21T16:00:00Z",
  },
  {
    id: "item_6",
    title: "Dockerfile – Node app",
    description: "Multi-stage production Dockerfile for Node.js",
    contentType: "text",
    content: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]`,
    language: "dockerfile",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tags: ["docker", "devops"],
    collectionIds: ["col_4"],
    lastUsedAt: "2026-04-21T14:00:00Z",
  },
  {
    id: "item_7",
    title: "Read CSV with pandas",
    description: "Load and preview a CSV file in pandas",
    contentType: "text",
    content: `import pandas as pd

df = pd.read_csv('data.csv')
print(df.head())
print(df.info())`,
    language: "python",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_snippet",
    tags: ["pandas", "data"],
    collectionIds: ["col_3"],
    lastUsedAt: "2026-04-21T12:00:00Z",
  },
  {
    id: "item_8",
    title: "kubectl get all (ns)",
    description: "List all resources in a namespace",
    contentType: "text",
    content: "kubectl get all -n [namespace]",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tags: ["kubernetes", "devops"],
    collectionIds: ["col_4"],
    lastUsedAt: "2026-04-21T10:00:00Z",
  },
];
