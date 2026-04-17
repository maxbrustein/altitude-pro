// Mounts task HTML partials into their placeholder comments inside each
// study-area. Runs once on boot. Future phases can swap this for a
// markdown renderer without changing the mount contract.

import { loadTask } from '../content.js';
import { areaDomId } from './dom-ids.js';

export async function mountAllTasks(manifest) {
  for (const area of manifest.areas) {
    const areaEl = document.getElementById(areaDomId(area.id));
    if (!areaEl) continue;
    for (const task of area.tasks) {
      const html = await loadTask('ppl', task.id);
      replaceTaskComment(areaEl, task.id, html);
    }
  }
}

function replaceTaskComment(root, taskId, html) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue.trim() === `task ${taskId}`) {
      const template = document.createElement('template');
      template.innerHTML = html;
      node.parentNode.replaceChild(template.content, node);
      return true;
    }
  }
  console.warn(`No placeholder comment for task ${taskId}`);
  return false;
}
