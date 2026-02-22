/**
 * Provides a namespace on the global window object, creating nested objects as needed.
 * @param namespace Namespace to create
 * @returns The created namespace object
 */
export function provide(namespace: string) {
  let nsl = namespace.split(".");
  let parent: any = window;
  for (let i = 0; i < nsl.length; i++) {
    let n = nsl[i];
    if (!parent[n]) {
      parent[n] = {};
    }
    parent = parent[n];
  }
  return parent;
}
