// Loads cert manifests, task HTML, and quiz topic JSON.
// Vite's import.meta.glob bundles content at build time, so loads are
// synchronous after the first call (no per-task network roundtrip).

const manifestCache = new Map();
const quizCache = new Map();
const taskCache = new Map();

const manifests = import.meta.glob('/content/certs/*/manifest.json', {
  eager: true,
  import: 'default',
});

const quizFiles = import.meta.glob('/content/certs/*/quiz/*.json', {
  eager: true,
  import: 'default',
});

const taskFiles = import.meta.glob('/content/certs/*/tasks/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export async function loadManifest(cert) {
  if (manifestCache.has(cert)) return manifestCache.get(cert);
  const key = `/content/certs/${cert}/manifest.json`;
  const manifest = manifests[key];
  if (!manifest) throw new Error(`No manifest for cert: ${cert}`);
  manifestCache.set(cert, manifest);
  return manifest;
}

export async function loadQuiz(cert, topic) {
  const key = `${cert}:${topic}`;
  if (quizCache.has(key)) return quizCache.get(key);
  const path = `/content/certs/${cert}/quiz/${topic}.json`;
  const data = quizFiles[path];
  if (!data) throw new Error(`No quiz for ${cert}/${topic}`);
  quizCache.set(key, data);
  return data;
}

export async function loadAllQuizTopics(cert) {
  const prefix = `/content/certs/${cert}/quiz/`;
  return Object.entries(quizFiles)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, data]) => ({
      topic: path.slice(prefix.length, -5),
      data,
    }));
}

export async function loadTask(cert, taskId) {
  const key = `${cert}:${taskId}`;
  if (taskCache.has(key)) return taskCache.get(key);
  const path = `/content/certs/${cert}/tasks/${taskId}.html`;
  const data = taskFiles[path];
  if (!data) throw new Error(`No task HTML for ${cert}/${taskId}`);
  taskCache.set(key, data);
  return data;
}
