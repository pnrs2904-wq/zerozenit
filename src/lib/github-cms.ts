const apiBase = 'https://api.github.com';

function cfg() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'pnrs2904-wq';
  const repo = process.env.GITHUB_REPO || 'zerozenit';
  const branch = process.env.GITHUB_BRANCH || 'main';
  const root = process.env.GITHUB_PROJECT_ROOT || 'zerozenit';
  if (!token) throw new Error('GITHUB_TOKEN is not configured.');
  return { token, owner, repo, branch, root };
}

async function github(path: string, init: RequestInit = {}) {
  const { token } = cfg();
  const res = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 500)}`);
  }
  return res.json();
}

function b64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function unb64(value: string) {
  return Buffer.from(value.replace(/\n/g, ''), 'base64').toString('utf8');
}

export function projectPath(relative: string) {
  const { root } = cfg();
  return `${root}/${relative}`.replace(/\\/g, '/');
}

export async function getFile(relative: string) {
  const { owner, repo, branch } = cfg();
  const path = projectPath(relative);
  const data = await github(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`);
  return { sha: data.sha as string, content: unb64(data.content as string), path };
}

export async function upsertFile(relative: string, content: string, message: string, sha?: string) {
  const { owner, repo, branch } = cfg();
  const path = projectPath(relative);
  return github(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: b64(content), branch, ...(sha ? { sha } : {}) }),
  });
}

export async function deleteFile(relative: string, message: string) {
  const current = await getFile(relative);
  const { owner, repo, branch } = cfg();
  const path = projectPath(relative);
  return github(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha: current.sha, branch }),
  });
}

export interface DirEntry { name: string; path: string; sha: string; type: 'file' | 'dir'; }

/** List a directory's contents (used to drive the article management table without a rebuild). */
export async function listDir(relative: string): Promise<DirEntry[]> {
  const { owner, repo, branch } = cfg();
  const path = projectPath(relative);
  try {
    const data = await github(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`);
    if (!Array.isArray(data)) return [];
    return data.map((d: any) => ({ name: d.name, path: d.path, sha: d.sha, type: d.type }));
  } catch (error) {
    if (error instanceof Error && error.message.includes('GitHub API 404')) return [];
    throw error;
  }
}

/** Upload a binary file (image) given base64 data, e.g. for featured images from the admin. */
export async function upsertBinaryFile(relative: string, base64Data: string, message: string) {
  const { owner, repo, branch } = cfg();
  const path = projectPath(relative);
  let sha: string | undefined;
  try { sha = (await getFile(relative)).sha; } catch (e) { if (!(e instanceof Error) || !e.message.includes('GitHub API 404')) throw e; }
  return github(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: base64Data, branch, ...(sha ? { sha } : {}) }),
  });
}

export async function commitJson<T>(relative: string, value: T, message: string) {
  let sha: string | undefined;
  try {
    sha = (await getFile(relative)).sha;
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('GitHub API 404')) throw error;
  }
  return upsertFile(relative, JSON.stringify(value, null, 2) + '\n', message, sha);
}
