import { doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export function generateSessionId() {
  return crypto.randomUUID();
}

export async function startSession(uid, sessionId, metadata = {}) {
  const ref = doc(db, "users", uid);
  const data = {
    activeSessionId: sessionId,
    lastLogin: new Date().toISOString(),
    lastDevice: metadata.device || "",
    lastBrowser: metadata.browser || "",
    lastPlatform: metadata.platform || "",
    lastIp: metadata.ip || "",
    lastUserAgent: metadata.userAgent || "",
    updatedAt: new Date().toISOString(),
  };
  return setDoc(ref, data, { merge: true });
}

export async function clearSession(uid) {
  const ref = doc(db, "users", uid);
  return setDoc(ref, {
    activeSessionId: null,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export function onSessionChange(uid, callback) {
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}
