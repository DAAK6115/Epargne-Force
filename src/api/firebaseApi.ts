// src/api/firebaseApi.ts
import { db } from "../firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// 1) Créer ou récupérer le profil pour un pseudo
export async function getMyProfile(pseudo: string) {
  const ref = doc(db, "profiles", pseudo); // id du doc = pseudo
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const shareCode = `EF-${pseudo}`;
    await setDoc(ref, {
      pseudo,
      shareCode,
      createdAt: serverTimestamp(),
    });
    return { id: pseudo, pseudo, shareCode };
  }

  return { id: snap.id, ...snap.data() } as any;
}

// 2) Entrer un code de partage (EF-yaya)
export async function linkByShareCode(myPseudo: string, code: string) {
  // On cherche le profil associé à ce shareCode
  const q = query(
    collection(db, "profiles"),
    where("shareCode", "==", code)
  );
  const res = await getDocs(q);

  if (res.empty) {
    throw new Error("Code invalide");
  }

  const targetDoc = res.docs[0];
  const targetData = targetDoc.data() as any;
  const toPseudo = targetDoc.id; // = pseudo de la personne

  // On crée une relation : moi (myPseudo) -> lui/elle (toPseudo)
  await addDoc(collection(db, "shareRelations"), {
    fromPseudo: myPseudo,
    toPseudo,
    status: "accepted",
    createdAt: serverTimestamp(),
  });

  return { id: toPseudo, ...targetData } as any;
}

// 3) Lister les personnes dont je peux voir l'activité
export async function getPartners(myPseudo: string) {
  const q = query(
    collection(db, "shareRelations"),
    where("fromPseudo", "==", myPseudo)
  );
  const res = await getDocs(q);

  const partners: any[] = [];

  for (const docRel of res.docs) {
    const { toPseudo } = docRel.data() as any;
    const profSnap = await getDoc(doc(db, "profiles", toPseudo));
    if (profSnap.exists()) {
      partners.push({
        id: toPseudo,
        ...profSnap.data(),
      });
    }
  }

  return partners;
}

// 4) Créer une transaction pour un utilisateur (par son pseudo)
export async function addTransaction({
  ownerPseudo,
  type,
  amount,
  label,
  date,
}: {
  ownerPseudo: string;
  type: "epargne" | "depense";
  amount: number;
  label?: string;
  date?: string; // "YYYY-MM-DD"
}) {
  await addDoc(collection(db, "transactions"), {
    ownerPseudo,
    type,
    amount,
    label: label || "",
    date: date || new Date().toISOString().slice(0, 10),
    createdAt: serverTimestamp(),
  });
}

// 5) Lister les transactions d'un partenaire (par pseudo)
export async function getPartnerTransactions(partnerPseudo: string) {
  const q = query(
    collection(db, "transactions"),
    where("ownerPseudo", "==", partnerPseudo)
  );

  const res = await getDocs(q);
  return res.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
}
