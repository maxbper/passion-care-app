import { getFirestore, collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

export const fetchUserData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          console.log("No user data found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
}

export const fetchLastWeeklyFormDate = async () => {
  try {
    while (auth.currentUser == null) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const userId = auth.currentUser.uid;
    const weeklyFormRef = collection(db, 'users', userId, 'weeklyform');

    const q = query(weeklyFormRef, orderBy('date', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    const forms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (forms.length == 0) {
        return null;
    } else {
        const lastForm = forms[0];
        const lastDate = lastForm.date.toDate();
        return lastDate;
    }

  } catch (error) {
    console.error('Error fetching weekly form:', error);
    return null;
  }
};

export const sendWeeklyForm = async (hquestions, fquestions, decision, suspended) => {
  try {
    while (auth.currentUser == null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const userId = auth.currentUser?.uid;

    const weeklyFormRef = collection(db, 'users', userId, 'weeklyform');
    const newFormRef = doc(weeklyFormRef);
    const date = new Date();

    await setDoc(newFormRef, {
        heatlh_answers: hquestions,
        functional_answers: fquestions,
        decision: decision,
        date: date,
    });

    if (suspended) {
        await setDoc(doc(db, 'users', userId), {
            suspended: suspended,
        }, { merge: true });
    }

  } catch (error) {
    console.error('Error sending weekly form:', error);
  }
};
