"use server";

export async function globalSearch(text: string) {
  if (typeof text !== "string") {
    throw new Error("Invalid input.");
  }
  if (text.length === 0) {
    return [];
  }
  try {
    return [];
  } catch (error) {
    console.log("error in global search", error);
    throw new Error("error in global search");
  }
}
