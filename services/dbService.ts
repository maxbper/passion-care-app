import { getFirestore, collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

export const fetchIsSuspended = async (userId) => {
    if (!userId) return;
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data().suspended;
        } else {
          console.log("No user data found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
};

export const fetchUserData = async () => {
    while (auth.currentUser == null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
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

export const fetchAdminList = async () => {
    try {
        const docRef = doc(db, "users", "roles");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data().admins;
        } else {
          console.log("No admin list found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching admin list data:", error);
      }
};

export const fetchModList = async () => {
    try {
        const docRef = doc(db, "users", "roles");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data().mods;
        } else {
          console.log("No mod list found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching mod list data:", error);
      }
};

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

export const uploadWeeklyForm = async (hquestions, fquestions, decision, suspended) => {
  try {
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

    await setDoc(doc(db, 'users', userId), {
        suspended: suspended,
        workout_plan: decision,
    }, { merge: true });


  } catch (error) {
    console.error('Error sending weekly form:', error);
  }
};

export const fetchLastWorkoutDate = async () => {
    try {
        while (auth.currentUser == null) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
      const userId = auth.currentUser?.uid;
      const weeklyFormRef = collection(db, 'users', userId, 'workouts');
  
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
      console.error('Error fetching workout:', error);
      return null;
    }
};

export const uploadWorkout = async (time) => {
    try {
        const userId = auth.currentUser?.uid;

        const workoutRef = collection(db, 'users', userId, 'workouts');
        const newWorkoutRef = doc(workoutRef);
        const date = new Date();

        await setDoc(newWorkoutRef, {
            // exercises will be added here and received in the function
            time: time,
            date: date,
        });

    } catch (error) {
        console.error('Error sending weekly form:', error);
    }
};

export const fetchWorkoutPlan = async () => {
    while (auth.currentUser == null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const userId = auth.currentUser?.uid;
    let plan = "";

    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          plan = docSnap.data().workout_plan;
        } else {
          console.log("No user workout found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching user workout:", error);
      }

    try {
        const docRef = doc(db, "exercises", "workouts");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return docSnap.data()[plan];
        } else {
          console.log("No workout plan found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching workout plan:", error);
      }
};

export const fetchExercise = async (exerciseId) => {
    while (auth.currentUser == null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    try {
        const docRef = doc(db, "exercises", exerciseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          console.log("No exercise found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching exercise:", error);
      }
};
