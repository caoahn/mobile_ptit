import { Tag } from "../models/tag.model";
import { Transaction } from "sequelize";

/**
 * Convert string to slug (remove Vietnamese accents, spaces)
 * Example: "Món Việt" -> "mon-viet"
 */
export function formatTagSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-"); // Replace spaces with hyphens
}

/**
 * Find or create tag by name
 * If tag doesn't exist, create new one with auto-generated slug
 */
export async function findOrCreateTag(
  name: string,
  transaction?: Transaction,
): Promise<Tag> {
  const slug = formatTagSlug(name);
  const [tag] = await Tag.findOrCreate({
    where: { slug },
    defaults: { name, slug },
    transaction,
  });
  return tag;
}
