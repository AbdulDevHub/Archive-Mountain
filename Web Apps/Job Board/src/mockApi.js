// A stand-in for the json-server backend (`npm run server`) on the static deploy.
// It answers the same /api/jobs routes from src/jobs.json and keeps edits in this browser's localStorage.
import axios from 'axios';
import seed from './jobs.json';

const KEY = 'job-board-jobs';

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // storage blocked: fall back to the seed data
  }
  return structuredClone(seed.jobs);
}

function save(jobs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(jobs));
  } catch {
    // storage blocked: edits only last until reload
  }
}

const respond = (config, status, data) => ({ data, status, statusText: String(status), headers: {}, config });

export function installMockApi() {
  axios.defaults.adapter = async (config) => {
    const match = /^\/api\/jobs(?:\/([^/?]+))?/.exec(config.url ?? '');
    if (!match) throw new Error(`No mock route for ${config.url}`);
    const id = match[1];
    const method = (config.method ?? 'get').toLowerCase();
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const jobs = load();
    const index = id ? jobs.findIndex((job) => String(job.id) === id) : -1;

    if (method === 'get' && !id) return respond(config, 200, jobs);
    if (method === 'post') {
      const job = { ...body, id: Math.random().toString(36).slice(2, 6) };
      save([...jobs, job]);
      return respond(config, 201, job);
    }
    if (index === -1) return Promise.reject(Object.assign(new Error('Job not found'), { response: respond(config, 404, {}) }));
    if (method === 'get') return respond(config, 200, jobs[index]);
    if (method === 'put') {
      jobs[index] = { ...body, id: jobs[index].id };
      save(jobs);
      return respond(config, 200, jobs[index]);
    }
    if (method === 'delete') {
      jobs.splice(index, 1);
      save(jobs);
      return respond(config, 200, {});
    }
    throw new Error(`Unsupported method ${method}`);
  };
}
