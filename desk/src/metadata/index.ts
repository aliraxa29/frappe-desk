import { desk } from "../utils/desk";

export async function getMeta(doctype: string) {
  try {
    const response = await desk.call({
      method: "desktop.meta.get_meta",
      args: {
        doctype: doctype,
        with_parent: true,
      },
    });
    return response.message.docs[0] || null;
  } catch (error) {
    console.error(`Error fetching metadata for ${doctype}:`, error);
    throw error;
  }
}
