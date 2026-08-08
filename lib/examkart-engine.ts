import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { db, ensureAuth } from "./firebase";
import { 
  ExamCategory, 
  ExamItem, 
  BookItem, 
  BundleItem, 
  UserEntitlement,
  PurchaseRecord,
  ExamSchema,
  QuestionResponse,
  ExamResult,
  UserSubscription,
  AccessType
} from "./types";
import { 
  INITIAL_CATEGORIES, 
  INITIAL_EXAMS, 
  INITIAL_BOOKS, 
  INITIAL_BUNDLES 
} from "./seed-data";

// Key constants for local cache
const LOCAL_STORAGE_KEY_PREFIX = "examkart_v1_";

// Local storage helper
function getLocalCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.warn("Failed to set local cache:", err);
  }
}

let autoSeeded = false;

export async function ensureAutoSeeded(): Promise<void> {
  if (autoSeeded) return;
  autoSeeded = true;
  try {
    await ensureAuth();
    const snap = await getDocs(collection(db, "exams"));
    if (snap.empty) {
      console.log("Firestore 'exams' collection is empty. Auto-seeding initial categories, exams, books, and bundles into Firestore...");
      await seedExamKartDatabase();
    }
  } catch (err) {
    console.warn("Auto-seed check notice:", err);
  }
}

/**
 * Seeds sample data into Firebase Firestore database 'examkart'
 * (and updates local cache simultaneously).
 */
export async function seedExamKartDatabase(): Promise<{ success: boolean; message: string; count: number }> {
  let seededCount = 0;
  try {
    await ensureAuth();

    const batch = writeBatch(db);

    // 1. Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      const ref = doc(db, "exam_categories", cat.id);
      batch.set(ref, cat, { merge: true });
      seededCount++;
    }

    // 2. Seed Exams
    for (const exam of INITIAL_EXAMS) {
      const ref = doc(db, "exams", exam.id);
      batch.set(ref, exam, { merge: true });
      seededCount++;
    }

    // 3. Seed Books
    for (const book of INITIAL_BOOKS) {
      const ref = doc(db, "books", book.id);
      batch.set(ref, book, { merge: true });
      seededCount++;
    }

    // 4. Seed Bundles
    for (const bundle of INITIAL_BUNDLES) {
      const ref = doc(db, "bundles", bundle.id);
      batch.set(ref, bundle, { merge: true });
      seededCount++;
    }

    await batch.commit();

    // Cache locally as well
    setLocalCache("exam_categories", INITIAL_CATEGORIES);
    setLocalCache("exams", INITIAL_EXAMS);
    setLocalCache("books", INITIAL_BOOKS);
    setLocalCache("bundles", INITIAL_BUNDLES);

    return {
      success: true,
      message: `Successfully seeded ${seededCount} documents across 4 collections ('exam_categories', 'exams', 'books', 'bundles') into Firebase Firestore ('examkart')!`,
      count: seededCount
    };
  } catch (error: any) {
    console.error("Firebase seed error:", error);

    // Cache locally as fallback so app functions fully
    setLocalCache("exam_categories", INITIAL_CATEGORIES);
    setLocalCache("exams", INITIAL_EXAMS);
    setLocalCache("books", INITIAL_BOOKS);
    setLocalCache("bundles", INITIAL_BUNDLES);

    const isPermissionError = error?.code === 'permission-denied' || error?.message?.includes('permission');

    return {
      success: false,
      message: isPermissionError
        ? "Firestore write blocked: Your Firebase project 'current-affairs-ea519' rules require open read/write permissions. Update rules in Firebase Console to 'allow read, write: if true;'. (Local cache is populated & ready)."
        : `Firebase error: ${error?.message || 'Failed to write to Firestore'}. (Local cache populated).`,
      count: 0
    };
  }
}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<ExamCategory[]> {
  try {
    const snap = await getDocs(collection(db, "exam_categories"));
    if (!snap.empty) {
      const items: ExamCategory[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as ExamCategory));
      items.sort((a, b) => a.display_order - b.display_order);
      setLocalCache("exam_categories", items);
      return items;
    } else {
      ensureAutoSeeded();
    }
  } catch (err) {
    console.warn("Firestore fetchCategories error, using cache/defaults:", err);
  }
  return getLocalCache<ExamCategory[]>("exam_categories") || INITIAL_CATEGORIES;
}

/**
 * Fetch exams (filtered by category if provided)
 */
export async function fetchExams(categoryName?: string): Promise<ExamItem[]> {
  try {
    let q;
    if (categoryName && categoryName !== "All") {
      q = query(
        collection(db, "exams"),
        where("category", "==", categoryName),
        where("isActive", "==", true)
      );
    } else {
      q = query(collection(db, "exams"), where("isActive", "==", true));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items: ExamItem[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as ExamItem));
      return items;
    } else {
      ensureAutoSeeded();
    }
  } catch (err) {
    console.warn("Firestore fetchExams error, using fallback:", err);
  }

  const cached = getLocalCache<ExamItem[]>("exams") || INITIAL_EXAMS;
  if (categoryName && categoryName !== "All") {
    return cached.filter(e => e.category.toLowerCase() === categoryName.toLowerCase() && e.isActive);
  }
  return cached.filter(e => e.isActive);
}

/**
 * Fetch books (filtered by category if provided)
 */
export async function fetchBooks(categoryName?: string): Promise<BookItem[]> {
  try {
    let q;
    if (categoryName && categoryName !== "All") {
      q = query(
        collection(db, "books"),
        where("category", "==", categoryName),
        where("isActive", "==", true)
      );
    } else {
      q = query(collection(db, "books"), where("isActive", "==", true));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items: BookItem[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as BookItem));
      return items;
    }
  } catch (err) {
    console.warn("Firestore fetchBooks error, using fallback:", err);
  }

  const cached = getLocalCache<BookItem[]>("books") || INITIAL_BOOKS;
  if (categoryName && categoryName !== "All") {
    return cached.filter(b => b.category.toLowerCase() === categoryName.toLowerCase() && b.isActive);
  }
  return cached.filter(b => b.isActive);
}

/**
 * Fetch bundles (filtered by category if provided)
 */
export async function fetchBundles(categoryName?: string): Promise<BundleItem[]> {
  try {
    let q;
    if (categoryName && categoryName !== "All") {
      q = query(
        collection(db, "bundles"),
        where("category", "==", categoryName),
        where("isActive", "==", true)
      );
    } else {
      q = query(collection(db, "bundles"), where("isActive", "==", true));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items: BundleItem[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as BundleItem));
      return items;
    }
  } catch (err) {
    console.warn("Firestore fetchBundles error, using fallback:", err);
  }

  const cached = getLocalCache<BundleItem[]>("bundles") || INITIAL_BUNDLES;
  if (categoryName && categoryName !== "All") {
    return cached.filter(b => b.category.toLowerCase() === categoryName.toLowerCase() && b.isActive);
  }
  return cached.filter(b => b.isActive);
}

/**
 * O(1) entitlement check for a user
 * Document ID format: {collection_name}_{doc_id}
 */
export async function checkUserEntitlement(
  userId: string,
  itemId: string,
  collectionName: 'exams' | 'books'
): Promise<boolean> {
  const entitlementDocId = `${collectionName}_${itemId}`;
  
  // Check local cache first
  const localEntitlements = getLocalCache<UserEntitlement[]>(`entitlements_${userId}`) || [];
  if (localEntitlements.some(e => e.id === entitlementDocId || (e.item_id === itemId && e.collection === collectionName))) {
    return true;
  }

  try {
    const docRef = doc(db, "users", userId, "entitlements", entitlementDocId);
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch {
    return false;
  }
}

/**
 * Get or initialize user subscription state
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const cached = getLocalCache<UserSubscription>(`user_sub_${userId}`);
  if (cached) return cached;

  try {
    const ref = doc(db, "users", userId, "subscription", "active");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as UserSubscription;
      setLocalCache(`user_sub_${userId}`, data);
      return data;
    }
  } catch {
    // ignore
  }

  const defaultSub: UserSubscription = { active: false };
  setLocalCache(`user_sub_${userId}`, defaultSub);
  return defaultSub;
}

export async function setUserSubscription(userId: string, active: boolean): Promise<UserSubscription> {
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const subData: UserSubscription = {
    active,
    subscribed_at: now.toISOString(),
    expires_at: expires,
    plan: 'monthly'
  };

  try {
    const ref = doc(db, "users", userId, "subscription", "active");
    await setDoc(ref, subData, { merge: true });
  } catch (err) {
    console.warn("Firestore subscription write fallback:", err);
  }

  setLocalCache(`user_sub_${userId}`, subData);
  return subData;
}

/**
 * Handle direct or bundle purchases with automatic entitlement grants
 */
export async function processPurchase(
  userId: string,
  item: ExamItem | BookItem | BundleItem | null,
  itemType: 'exam' | 'book' | 'bundle' | 'subscription',
  accessType: AccessType = 'lifetime'
): Promise<{ success: boolean; unlockedItemsCount: number; message: string }> {
  let unlockedCount = 0;
  const now = new Date();
  const nowIso = now.toISOString();

  // Calculate expiration
  let expiresAtIso: string | null = null;
  if (accessType === 'rent' || accessType === 'subscription' || itemType === 'subscription') {
    const expiresDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    expiresAtIso = expiresDate.toISOString();
  }

  const downloadOfflineEnabled = accessType === 'lifetime';

  // Handle global subscription purchase
  if (itemType === 'subscription') {
    await setUserSubscription(userId, true);
    return {
      success: true,
      unlockedItemsCount: 1,
      message: '⚡ Activated Monthly All-Access Pass! All books & exams unlocked for 30 days.'
    };
  }

  if (!item) {
    return { success: false, unlockedItemsCount: 0, message: 'Invalid item provided.' };
  }

  // Local state update helper
  const existingLocal = getLocalCache<UserEntitlement[]>(`entitlements_${userId}`) || [];
  const updatedLocal = [...existingLocal];

  const amount = accessType === 'rent' 
    ? (('rent_price' in item && item.rent_price) ? item.rent_price : Math.round(item.buy_price * 0.25))
    : item.buy_price;

  try {
    if (itemType === 'bundle') {
      const bundle = item as BundleItem;
      const batch = writeBatch(db);

      for (const inc of bundle.included_items) {
        const entitlementId = `${inc.collection}_${inc.id}`;
        const entRef = doc(db, "users", userId, "entitlements", entitlementId);
        const data: UserEntitlement = {
          id: entitlementId,
          collection: inc.collection,
          item_id: inc.id,
          category: bundle.category,
          granted_via: bundle.id,
          purchased_at: nowIso,
          access_type: accessType,
          expires_at: expiresAtIso,
          download_offline_enabled: downloadOfflineEnabled
        };
        batch.set(entRef, data, { merge: true });

        const existingIdx = updatedLocal.findIndex(e => e.id === entitlementId);
        if (existingIdx >= 0) {
          updatedLocal[existingIdx] = data;
        } else {
          updatedLocal.push(data);
        }
        unlockedCount++;
      }

      // Record purchase
      const purchaseRef = doc(collection(db, "purchases"));
      const purchaseData: PurchaseRecord = {
        id: purchaseRef.id,
        user_id: userId,
        item_type: 'bundle',
        item_id: bundle.id,
        item_title: bundle.title,
        amount,
        access_type: accessType,
        created_at: nowIso,
        expires_at: expiresAtIso
      };
      batch.set(purchaseRef, purchaseData);

      await batch.commit();
    } else {
      const collectionName = itemType === 'exam' ? 'exams' : 'books';
      const entitlementId = `${collectionName}_${item.id}`;
      const entRef = doc(db, "users", userId, "entitlements", entitlementId);
      
      const entData: UserEntitlement = {
        id: entitlementId,
        collection: collectionName,
        item_id: item.id,
        category: item.category,
        granted_via: 'direct',
        purchased_at: nowIso,
        access_type: accessType,
        expires_at: expiresAtIso,
        download_offline_enabled: downloadOfflineEnabled
      };

      await setDoc(entRef, entData, { merge: true });

      const existingIdx = updatedLocal.findIndex(e => e.id === entitlementId);
      if (existingIdx >= 0) {
        updatedLocal[existingIdx] = entData;
      } else {
        updatedLocal.push(entData);
      }
      unlockedCount = 1;

      // Log purchase
      const purchaseRef = doc(collection(db, "purchases"));
      await setDoc(purchaseRef, {
        id: purchaseRef.id,
        user_id: userId,
        item_type: itemType,
        item_id: item.id,
        item_title: item.title,
        amount,
        access_type: accessType,
        created_at: nowIso,
        expires_at: expiresAtIso
      });
    }

    setLocalCache(`entitlements_${userId}`, updatedLocal);
    const modeLabel = accessType === 'lifetime' ? 'Lifelong' : accessType === 'rent' ? '30-day Rent' : 'Monthly Sub';
    return {
      success: true,
      unlockedItemsCount: unlockedCount,
      message: `🎉 Successfully unlocked ${item.title} (${modeLabel})!`
    };
  } catch (err: any) {
    console.warn("Firebase purchase fallback to local state:", err);
    
    // Fallback: unlock in local cache so user gets instant gratification
    if (itemType === 'bundle') {
      const bundle = item as BundleItem;
      for (const inc of bundle.included_items) {
        const entitlementId = `${inc.collection}_${inc.id}`;
        const data: UserEntitlement = {
          id: entitlementId,
          collection: inc.collection,
          item_id: inc.id,
          category: bundle.category,
          granted_via: bundle.id,
          purchased_at: nowIso,
          access_type: accessType,
          expires_at: expiresAtIso,
          download_offline_enabled: downloadOfflineEnabled
        };
        const existingIdx = updatedLocal.findIndex(e => e.id === entitlementId);
        if (existingIdx >= 0) updatedLocal[existingIdx] = data;
        else updatedLocal.push(data);
        unlockedCount++;
      }
    } else {
      const collectionName = itemType === 'exam' ? 'exams' : 'books';
      const entitlementId = `${collectionName}_${item.id}`;
      const data: UserEntitlement = {
        id: entitlementId,
        collection: collectionName,
        item_id: item.id,
        category: item.category,
        granted_via: 'direct',
        purchased_at: nowIso,
        access_type: accessType,
        expires_at: expiresAtIso,
        download_offline_enabled: downloadOfflineEnabled
      };
      const existingIdx = updatedLocal.findIndex(e => e.id === entitlementId);
      if (existingIdx >= 0) updatedLocal[existingIdx] = data;
      else updatedLocal.push(data);
      unlockedCount = 1;
    }

    setLocalCache(`entitlements_${userId}`, updatedLocal);
    return {
      success: true,
      unlockedItemsCount: unlockedCount,
      message: `Unlocked ${item.title} locally!`
    };
  }
}

/**
 * Helper to generate default initial demo entitlements if none exist,
 * so the user can immediately test all 3 status types ('Lifelong', 'On Rent', 'Monthly Sub', 'Expired').
 */
export function getDefaultSampleEntitlements(): UserEntitlement[] {
  const now = new Date();
  
  // 1. Lifetime purchase (SSC CGL 2024 Tier 1)
  const e1: UserEntitlement = {
    id: 'exams_exam_ssc_cgl_2024',
    collection: 'exams',
    item_id: 'exam_ssc_cgl_2024',
    category: 'SSC',
    granted_via: 'direct',
    purchased_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    access_type: 'lifetime',
    expires_at: null,
    download_offline_enabled: true
  };

  // 2. On Rent - 18 days left (Reasoning Tricks book)
  const e2: UserEntitlement = {
    id: 'books_book_reasoning_tricks_2024',
    collection: 'books',
    item_id: 'book_reasoning_tricks_2024',
    category: 'Banking',
    granted_via: 'direct',
    purchased_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    access_type: 'rent',
    expires_at: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    download_offline_enabled: false
  };

  // 3. Monthly Subscription - 22 days left (Complete Mathematics book)
  const e3: UserEntitlement = {
    id: 'books_book_math_complete_2024',
    collection: 'books',
    item_id: 'book_math_complete_2024',
    category: 'SSC',
    granted_via: 'subscription',
    purchased_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    access_type: 'subscription',
    expires_at: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    download_offline_enabled: false
  };

  // 4. Expired Rent - expired 2 days ago (CTET Paper 1 & 2 Course)
  const e4: UserEntitlement = {
    id: 'exams_exam_ctet_paper_2024',
    collection: 'exams',
    item_id: 'exam_ctet_paper_2024',
    category: 'Teaching',
    granted_via: 'direct',
    purchased_at: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    access_type: 'rent',
    expires_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    download_offline_enabled: false
  };

  return [e1, e2, e3, e4];
}

/**
 * Get all entitlements for user
 */
export async function getUserEntitlements(userId: string): Promise<UserEntitlement[]> {
  try {
    const snap = await getDocs(collection(db, "users", userId, "entitlements"));
    if (!snap.empty) {
      const list: UserEntitlement[] = [];
      snap.forEach(d => list.push(d.data() as UserEntitlement));
      setLocalCache(`entitlements_${userId}`, list);
      return list;
    }
  } catch (err) {
    console.warn("Firestore getUserEntitlements error, returning local cache:", err);
  }

  const cached = getLocalCache<UserEntitlement[]>(`entitlements_${userId}`);
  if (cached && cached.length > 0) return cached;

  // Initialize sample entitlements for demo if empty
  const samples = getDefaultSampleEntitlements();
  setLocalCache(`entitlements_${userId}`, samples);
  return samples;
}

/**
 * Fetch Exam Test Schema for Test Runner Modal
 */
export async function fetchExamTestSchema(testUrlOrId: string, examTitle: string): Promise<ExamSchema> {
  try {
    const docRef = doc(db, 'test_schemas', testUrlOrId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ExamSchema;
    }
  } catch (err) {
    console.warn("Firestore test schema fetch error, using generator:", err);
  }

  return {
    id: testUrlOrId || 'test_demo',
    title: examTitle || 'Mock Test Series 2026',
    timeMinutes: 60,
    totalMarks: 100,
    negativeMarking: 0.25,
    sections: [
      {
        id: 'sec_1',
        title: 'General Intelligence & Reasoning',
        questions: [
          {
            id: 'q1',
            stem: 'Select the related word/letters/number from the given alternatives: 12 : 144 :: 15 : ?',
            opts: ['180', '225', '210', '240'],
            key: 1,
            sol: '12² = 144. Similarly, 15² = 225.',
            tag: 'Analogy'
          },
          {
            id: 'q2',
            stem: 'If CODES is written as DPEFT in a certain code language, how is STUDY written in that code?',
            opts: ['TUVEZ', 'TVVEZ', 'TUVEY', 'TUVDZ'],
            key: 0,
            sol: 'Each letter is shifted by +1 in alphabetical order. S->T, T->U, U->V, D->E, Y->Z.',
            tag: 'Coding-Decoding'
          },
          {
            id: 'q3',
            stem: 'Find the odd one out from the given options:',
            opts: ['27', '64', '125', '144'],
            key: 3,
            sol: '27 (3³), 64 (4³), 125 (5³) are perfect cubes. 144 is 12² (a square).',
            tag: 'Classification'
          }
        ]
      },
      {
        id: 'sec_2',
        title: 'Quantitative Aptitude',
        questions: [
          {
            id: 'q4',
            stem: 'A train 150m long passes a telegraph post in 10 seconds. What is the speed of the train in km/h?',
            opts: ['45 km/h', '54 km/h', '60 km/h', '72 km/h'],
            key: 1,
            sol: 'Speed = Distance / Time = 150m / 10s = 15 m/s. In km/h = 15 × (18/5) = 54 km/h.',
            tag: 'Speed & Distance'
          },
          {
            id: 'q5',
            stem: 'If the simple interest on a sum of money for 2 years at 5% p.a. is ₹200, find the principal amount.',
            opts: ['₹1,500', '₹2,000', '₹2,500', '₹3,000'],
            key: 1,
            sol: 'SI = (P × R × T) / 100 ⇒ 200 = (P × 5 × 2) / 100 ⇒ P = ₹2,000.',
            tag: 'Interest'
          }
        ]
      },
      {
        id: 'sec_3',
        title: 'English Language',
        questions: [
          {
            id: 'q6',
            stem: 'Choose the correct synonym for "MANDATORY":',
            opts: ['Optional', 'Compulsory', 'Discretionary', 'Voluntary'],
            key: 1,
            sol: 'Mandatory means required by law or rules; compulsory.',
            tag: 'Vocabulary'
          },
          {
            id: 'q7',
            stem: 'Fill in the blank: Neither he nor his friends _____ present at the meeting.',
            opts: ['was', 'were', 'is', 'are'],
            key: 1,
            sol: 'When subjects are connected by "neither... nor", the verb agrees with the closer subject ("his friends" -> plural -> "were").',
            tag: 'Grammar'
          }
        ]
      }
    ]
  };
}

export function evaluateSubmission(
  schema: ExamSchema,
  responses: QuestionResponse[],
  totalSpentTime: number
): ExamResult {
  const allQs = schema.sections.flatMap(s => s.questions);
  let correct = 0;
  let incorrect = 0;
  let attempted = 0;
  let unattempted = 0;

  const tagMap: Record<string, { tag: string; total: number; correct: number; timeSpent: number }> = {};

  allQs.forEach(q => {
    const resp = responses.find(r => r.qId === q.id);
    const tag = q.tag || 'General';

    if (!tagMap[tag]) {
      tagMap[tag] = { tag, total: 0, correct: 0, timeSpent: 0 };
    }
    tagMap[tag].total += 1;

    if (resp) {
      tagMap[tag].timeSpent += resp.timeSec;
      if (resp.ans !== null && resp.ans !== undefined) {
        attempted++;
        if (resp.ans === q.key) {
          correct++;
          tagMap[tag].correct += 1;
        } else {
          incorrect++;
        }
      } else {
        unattempted++;
      }
    } else {
      unattempted++;
    }
  });

  const marksObtained = (correct * 2) - (incorrect * schema.negativeMarking);
  const accuracyPercentage = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  const tagAnalysis = Object.entries(tagMap).map(([tag, val]) => ({
    tag,
    correct: val.correct,
    total: val.total,
    timeSpent: val.timeSpent
  }));

  return {
    examId: schema.id,
    examTitle: schema.title,
    totalQuestions: allQs.length,
    attempted,
    correct,
    incorrect,
    unattempted,
    marksObtained: Math.max(0, Number(marksObtained.toFixed(2))),
    totalMarks: schema.totalMarks,
    accuracyPercentage,
    totalTimeSpentSec: totalSpentTime,
    responses,
    tagAnalysis,
    completedAt: new Date().toISOString(),
    negativeMarks: Number((incorrect * schema.negativeMarking).toFixed(2)),
    score: Math.max(0, Number(marksObtained.toFixed(2))),
    maxScore: schema.totalMarks,
    correctCount: correct,
    incorrectCount: incorrect,
    accuracy: accuracyPercentage,
    topicBreakdown: tagMap
  };
}

export async function saveTestSubmission(userId?: string, result?: ExamResult): Promise<void> {
  if (!userId || !result) return;
  try {
    const docRef = doc(db, 'users', userId, 'test_results', `${result.examId}_${Date.now()}`);
    await setDoc(docRef, {
      ...result,
      submittedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save test submission to Firestore:', err);
  }
}
