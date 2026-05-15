import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './config'

export async function uploadProfilePicture(uid, file) {
  const profilePicRef = ref(storage, `Profile/${uid}/ProfilePic`)
  const snapshot = await uploadBytes(profilePicRef, file, {
    contentType: file.type || 'image/jpeg'
  })

  return getDownloadURL(snapshot.ref)
}
