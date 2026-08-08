import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { BookItem } from "./types";
import { INITIAL_BOOKS } from "./seed-data";

export async function fetchFirestoreBookBySlugOrId(slugOrId: string): Promise<(BookItem & { pdfurl?: string; sampleurl?: string }) | null> {
  if (!slugOrId) return null;

  try {
    // 1. Try fetching by doc ID directly
    const docRef = doc(db, "books", slugOrId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as BookItem;
      return {
        ...data,
        id: snap.id,
        pdfurl: (data as any).pdfurl || data.pdf_file,
        sampleurl: (data as any).sampleurl || data.sample_file
      };
    }

    // 2. Try fetching by slug
    const q = query(collection(db, "books"), where("slug", "==", slugOrId));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const firstDoc = querySnap.docs[0];
      const data = firstDoc.data() as BookItem;
      return {
        ...data,
        id: firstDoc.id,
        pdfurl: (data as any).pdfurl || data.pdf_file,
        sampleurl: (data as any).sampleurl || data.sample_file
      };
    }
  } catch (err) {
    console.warn("Error looking up book in Firestore:", err);
  }

  // 3. Fallback to INITIAL_BOOKS / local cache
  const match = INITIAL_BOOKS.find(b => b.id === slugOrId || b.slug === slugOrId);
  if (match) {
    return {
      ...match,
      pdfurl: match.pdf_file,
      sampleurl: match.sample_file
    };
  }

  return null;
}
