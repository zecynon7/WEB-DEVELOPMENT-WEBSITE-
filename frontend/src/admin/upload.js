import { api } from "../lib/axios";

/** Sends one image to the server, which stores it on Cloudinary. Returns { url, public_id }. */
export async function uploadImage(file, folder = "pages") {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("That image is larger than 10 MB. Please choose a smaller one.");
  const fd = new FormData();
  fd.append("image", file);
  fd.append("folder", folder);
  const { data } = await api.post("/admin/upload", fd);
  return data.image;
}
