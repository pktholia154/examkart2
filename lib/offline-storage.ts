import Dexie, { Table } from "dexie";

export interface OfflinePdfRecord {
  bookId: string;
  pdfData: ArrayBuffer;
  title?: string;
  savedAt: string;
}

class PdfOfflineDatabase extends Dexie {
  pdfFiles!: Table<OfflinePdfRecord, string>;

  constructor() {
    super("ExamKartPdfOfflineDB");
    this.version(1).stores({
      pdfFiles: "bookId, savedAt"
    });
  }
}

export const offlineDb = new PdfOfflineDatabase();

export async function savePdfOffline(bookId: string, pdfData: ArrayBuffer, title?: string): Promise<void> {
  if (!bookId || !pdfData) return;
  try {
    await offlineDb.pdfFiles.put({
      bookId,
      pdfData,
      title,
      savedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Failed to save PDF offline:", err);
  }
}

export async function getPdfOffline(bookId: string): Promise<ArrayBuffer | null> {
  if (!bookId) return null;
  try {
    const record = await offlineDb.pdfFiles.get(bookId);
    return record?.pdfData || null;
  } catch (err) {
    console.error("Failed to fetch offline PDF:", err);
    return null;
  }
}

export async function removePdfOffline(bookId: string): Promise<void> {
  if (!bookId) return;
  try {
    await offlineDb.pdfFiles.delete(bookId);
  } catch (err) {
    console.error("Failed to delete offline PDF:", err);
  }
}

export async function isPdfOfflineSaved(bookId: string): Promise<boolean> {
  if (!bookId) return false;
  try {
    const count = await offlineDb.pdfFiles.where("bookId").equals(bookId).count();
    return count > 0;
  } catch {
    return false;
  }
}
