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
  // On accepte soit "EF-pseudo", soit juste "pseudo"
  let pseudoPart = code.trim();
  if (!pseudoPart) throw new Error("Entre un code.");

  if (pseudoPart.toUpperCase().startsWith("EF-")) {
    pseudoPart = pseudoPart.slice(3);
  }
  const normPseudo = pseudoPart.trim().toLowerCase();
  if (!normPseudo) {
    throw new Error("Code invalide");
  }

  // On cherche le profil associé à ce pseudo (via shareCode déjà créé par getMyProfile)
  const q = query(
    collection(db, "profiles"),
    where("shareCode", "==", `EF-${normPseudo}`)
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

// 6) Création de compte (Firestore)
export async function signupAccount({
  name,
  email,
  pseudo,
  password,
}: {
  name: string;
  email: string;
  pseudo: string;
  password: string;
}) {
  const normEmail = email.trim().toLowerCase();
  const normPseudo = pseudo.trim().toLowerCase();
  const safeName = name.trim() || pseudo.trim();

  if (!normEmail || !normPseudo || !password || !safeName) {
    throw new Error("Tous les champs sont obligatoires.");
  }

  const usersRef = collection(db, "users");

  // Vérifier unicité email
  const emailQ = query(usersRef, where("email", "==", normEmail));
  const emailSnap = await getDocs(emailQ);
  if (!emailSnap.empty) {
    throw new Error("Un compte existe déjà avec cet email.");
  }

  // Vérifier unicité pseudo
  const pseudoQ = query(usersRef, where("pseudo", "==", normPseudo));
  const pseudoSnap = await getDocs(pseudoQ);
  if (!pseudoSnap.empty) {
    throw new Error("Ce pseudo est déjà utilisé.");
  }

  // Créer l'utilisateur dans la collection users
  const userDoc = await addDoc(usersRef, {
    name: safeName,
    email: normEmail,
    pseudo: normPseudo,
    password,
    createdAt: serverTimestamp(),
  });

  const shareCode = `EF-${normPseudo}`;

  // Créer/mettre à jour le profil pour le partage (collection profiles)
  await setDoc(doc(db, "profiles", normPseudo), {
    name: safeName,
    email: normEmail,
    pseudo: normPseudo,
    shareCode,
    userId: userDoc.id,
    createdAt: serverTimestamp(),
  });

  return {
    id: userDoc.id,
    name: safeName,
    email: normEmail,
    pseudo: normPseudo,
  };
}

// 7) Connexion via email ou pseudo
export async function loginAccount({
  identifier,
  password,
}: {
  identifier: string;
  password: string;
}) {
  const norm = identifier.trim().toLowerCase();
  if (!norm || !password) {
    throw new Error("Email/pseudo et mot de passe sont obligatoires.");
  }

  const usersRef = collection(db, "users");

  const isEmail = norm.includes("@");
  const q = isEmail
    ? query(usersRef, where("email", "==", norm))
    : query(usersRef, where("pseudo", "==", norm));

  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("Email/pseudo ou mot de passe incorrect.");
  }

  const docSnap = snap.docs[0];
  const data = docSnap.data() as any;

  if (data.password !== password) {
    throw new Error("Email/pseudo ou mot de passe incorrect.");
  }

  return {
    id: docSnap.id,
    name: data.name,
    email: data.email,
    pseudo: data.pseudo,
  };
}
