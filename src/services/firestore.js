import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc
} from "firebase/firestore";
import { db } from "./firebase";

export function getCol(name) {
  return collection(db, name);
}

export function getRef(colName, id) {
  return doc(db, colName, id);
}

export function getDocById(colName, id) {
  return getDoc(doc(db, colName, id));
}

export function getDocsByQuery(colName, conditions = [], orders = [], limits = null) {
  let q = collection(db, colName);
  const constraints = [];

  conditions.forEach(({ field, op, value }) => {
    constraints.push(where(field, op, value));
  });

  orders.forEach(({ field, dir }) => {
    constraints.push(orderBy(field, dir));
  });

  if (limits) {
    constraints.push(limit(limits));
  }

  q = query(q, ...constraints);
  return getDocs(q);
}

export function getAll(colName) {
  return getDocs(collection(db, colName));
}

export function setDocById(colName, id, data) {
  return setDoc(doc(db, colName, id), data);
}

export function updateDocById(colName, id, data) {
  return updateDoc(doc(db, colName, id), data);
}

export function deleteDocById(colName, id) {
  return deleteDoc(doc(db, colName, id));
}

export function addToCol(colName, data) {
  return addDoc(collection(db, colName), data);
}

export function getSubCollection(parentCol, parentId, subCol) {
  return getDocs(collection(db, parentCol, parentId, subCol));
}

export function addToSubCollection(parentCol, parentId, subCol, data) {
  return addDoc(collection(db, parentCol, parentId, subCol), data);
}

export function setSubDoc(parentCol, parentId, subCol, docId, data) {
  return setDoc(doc(db, parentCol, parentId, subCol, docId), data);
}
