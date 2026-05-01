import { db } from './config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

async function ensureUserInRBAC(uid) {
  const ref = doc(db, 'RBAC', uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      role: 'admin',
      createdAt: new Date().toISOString(),
    })
    return 'admin'
  }

  return snap.data().role || 'admin'
}

export default ensureUserInRBAC
