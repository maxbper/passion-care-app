import { getFirestore, collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth, } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';

export const fetchIsSuspended = async (userId=null) => {
    if (!userId) {
        while (auth.currentUser == null) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        userId = auth.currentUser?.uid;
    }
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

export const fetchGender = async () => {
  while (auth.currentUser == null) {
      await new Promise(resolve => setTimeout(resolve, 1000));
  }
  const  userId = auth.currentUser?.uid;
  if (!userId) return;
  try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().gender;
      } else {
        console.log("No user gender found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user gender:", error);
    }
};     

export const fetchCancerType = async () => {
  while (auth.currentUser == null) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  const userId = auth.currentUser?.uid;
  if (!userId) return;
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data().cancer_type;
      } else {
        console.log("No user data found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
};

export const fetchXp = async () => {
    while (auth.currentUser == null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const userId = auth.currentUser?.uid;
    if (!userId) return;
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data().xp;
        } else {
          console.log("No user data found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
};

export const addXp = async (amount) => {
  while (auth.currentUser == null) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  let previous_xp = 0;

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      previous_xp = docSnap.data().xp;
    } else {
      console.log("No user data found!");
    }
  } catch (error) {
    console.error("Error fetching user xp:", error);
  }

  try {
    await setDoc(doc(db, 'users', userId), {
        xp: previous_xp + amount,
    }, { merge: true });
    } catch (error) {
        console.error('Error setting xp:', error);
    }
}

export const fetchUserData = async (uid=null) => {
    while (auth.currentUser == null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    let userId = auth.currentUser?.uid;
    if (uid) {
        userId = uid;
    }
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
};

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

    if(fquestions.length == 0) {
      await setDoc(newFormRef, {
        heatlh_answers: hquestions,
        decision: decision,
        date: date,
    });
    }
    else {
      await setDoc(newFormRef, {
          heatlh_answers: hquestions,
          functional_answers: fquestions,
          decision: decision,
          date: date,
      });
    }

    await setDoc(doc(db, 'users', userId), {
        suspended: suspended,
        workout_plan: decision,
    }, { merge: true });


  } catch (error) {
    console.error('Error sending weekly form:', error);
  }
};

export const setIsSuspended = async (suspended, userId=auth.currentUser?.uid) => {
    try {
        await setDoc(doc(db, 'users', userId), {
            suspended: suspended,
        }, { merge: true });
    } catch (error) {
        console.error('Error setting suspended status:', error);
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

export const uploadWorkout = async (t, hr, f) => {
  const userId = auth.currentUser?.uid;
  let plan = "";

    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        plan = docSnap.data().workout_plan;
      } else {
        console.log("No user workout plan found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user workout plan:", error);
    }

    try {
        const workoutRef = collection(db, 'users', userId, 'workouts');
        const newWorkoutRef = doc(workoutRef);
        const date = new Date();

        await setDoc(newWorkoutRef, {
            time: t,
            workout_plan: plan,
            heart_rate: hr,
            date: date,
            feedback: f,
        });

    } catch (error) {
        console.error('Error sending workout:', error);
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
          return [docSnap.data()[plan], plan];
        } else {
          console.log("No workout plan found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching workout plan:", error);
      }
};

export const fetchWarmupPlan = async (plan) => {
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
}

export const fetchExercise = async (exerciseId, plan) => {
    while (auth.currentUser == null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    try {
        const docRef = doc(db, "exercises", exerciseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return [docSnap.data()["name"], docSnap.data()[plan]];
        } else {
          console.log("No exercise found!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching exercise:", error);
      }
};

export const registerUser = async (form) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, "123456");
        const userId = userCredential.user.uid;

        const docRef = doc(db, "users", userId);

        await setDoc(docRef, {
            name: form.name,
            age: form.age,
            email: form.email,
            height: form.height,
            weight: form.weight,
            gender: form.gender,
            medical_history: form.medical_history,
            usual_medication: form.usual_medication,
            exercise_history: form.exercise_history,
            exercise_preferences: form.exercise_preferences,
            previous_cipn_diagnosis: form.previous_cipn_diagnosis,
            neurotoxic_agent: form.neurotoxic_agent,
            chemo_protocol: form.chemo_protocol,
            cancer_type: form.cancer_type,
            chemo_goal: form.chemo_goal,
            suspended: false,
            workout_plan: "",
            xp: 0,
        });

    } catch (error) {
        console.error("Error registering user:", error);
    }
};

export const registerMod = async (form) => {
  try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, "123456");
      const userId = userCredential.user.uid;

      const docRef = doc(db, "users", userId);

      await setDoc(docRef, {
          name: form.name,
          email: form.email,
          users: [],
      });

  } catch (error) {
      console.error("Error registering mod:", error);
  }

  try {
    const uid = auth.currentUser.uid;
    await setDoc(doc(db, "users", "roles"), {
        mods: arrayUnion(uid),
    }, { merge: true });
  } catch (error) {
      console.error("Error adding mod to list:", error);
  }
};

export const registerAdmin = async (form) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, form.email, "123456");
    const userId = userCredential.user.uid;

    const docRef = doc(db, "users", userId);

      await setDoc(docRef, {
          name: form.name,
          email: form.email,
          users: [],
      });

    } catch (error) {
      console.error("Error registering admin:", error);
  }

  try {
    const userId = auth.currentUser.uid;
    await setDoc(doc(db, "users", "roles"), {
        admins: arrayUnion(userId),
    }, { merge: true });
  } catch (error) {
      console.error("Error adding admin to list:", error);
  }
};

export const addUserToList = async (uid) => {
    while (auth.currentUser == null) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const adminUid = auth.currentUser.uid;

    try {
        await setDoc(doc(db, "users", adminUid), {
            users: arrayUnion(uid),
        }, { merge: true });
    } catch (error) {
        console.error("Error adding user to list:", error);
    }
};

export const fetchUserList = async (uid=null) => {
  let userId = auth.currentUser?.uid;
  if (uid) {
    userId = uid;
  }
  let userList = [];

  if (!userId) return;
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        userList = docSnap.data().users;
      } else {
        console.log("No user list found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    }

    const users = await Promise.all(
      userList?.map(async (uid) => {
        try {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            const userData = docSnap.data();
            return {
              id: uid,
              name: userData.name,
            };
          } else {
            console.log("No user data found for", uid);
            return null;
          }
        } catch (error) {
          console.error("Error fetching user data for", uid, ":", error);
          return null;
        }
      })
    );
    return users.filter((user) => user !== null);

}

export const fetchAdminsAndMods = async () => {
  const adminList = await fetchAdminList();
  const modList = await fetchModList();

  const adminPromises = adminList?.map(async (adminId) => {
    try {
      const docRef = doc(db, "users", adminId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const adminData = docSnap.data();
        return {
          id: adminId,
          name: adminData.name,
          email: adminData.email,
        };
      } else {
        console.log("No admin data found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      return null;
    }
  });
  const modPromises = modList?.map(async (modId) => {
    try {
      const docRef = doc(db, "users", modId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const modData = docSnap.data();
        return {
          id: modId,
          name: modData.name,
          email: modData.email,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching mod data:", error);
      return null;
    }
  });

  const admins = (await Promise.all(adminPromises)).filter((admin) => admin !== null);
  const mods = (await Promise.all(modPromises)).filter((mod) => mod !== null);

  return [admins, mods];
};

export const deleteAdminOrMod = async (received_uid) => {
    let admins = await fetchAdminList();
    let mods = await fetchModList();

    if(admins.includes(received_uid)) {
        admins = admins.filter(item => item !== received_uid);
    }
    if(mods.includes(received_uid)) {
        mods = mods.filter(item => item !== received_uid);
    }

    try {

      await setDoc(doc(db, "users", "roles"), {
          admins: admins,
          mods: mods,
      }, { merge: false });

  } catch (error) {
    console.error("Error deleting user from roles:", error);
  }

  try {
    const userRef = doc(db, "users", received_uid);
    await deleteDoc(userRef);

  } catch (error) {
    console.error("Error deleting user doc:", error);
  }
};

export const deleteUser = async (user_uid, mod_uid) => {
  let usersList = [];
  try {
    const docRef = doc(db, "users", mod_uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      usersList = docSnap.data().users;
    } else {
      console.log("No user list found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user list:", error);
  }

  if(usersList.includes(user_uid)) {
    usersList = usersList.filter(item => item !== user_uid);
  }

  try {
    await setDoc(doc(db, "users", mod_uid), {
        users: usersList,
    }, { merge: true });

  } catch (error) {
    console.error("Error deleting user from list:", error);
  }

  try {
    const userRef = collection(db, "users", user_uid, "weeklyform");
    const snapshot = await getDocs(userRef);

    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error("Error deleting user weeklyfroms:", error);
  }
  try {
    const userRef = collection(db, "users", user_uid, "workouts");
    const snapshot = await getDocs(userRef);

    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error("Error deleting user workouts:", error);
  }
  try {
    const userRef = collection(db, "users", user_uid, "clinical_register");
    const snapshot = await getDocs(userRef);

    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error("Error deleting user clinical register:", error);
  }

  try {
    const userRef = doc(db, "users", user_uid);
    await deleteDoc(userRef);

  } catch (error) {
    console.error("Error deleting user doc:", error);
  }
};

export const fetchWeeklyForms = async (uid) => {
      try {
        const weeklyFormRef = collection(db, 'users', uid, 'weeklyform');
        const q = query(weeklyFormRef, orderBy('date', 'asc'));
        const snapshot = await getDocs(q);
  
        const forms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        return forms;
      } catch (error) {
        console.error('Error fetching weekly form:', error);
        return null;
      }
}

export const fetchWorkouts = async (uid) => {
  try {
    const weeklyFormRef = collection(db, 'users', uid, 'workouts');
    const q = query(weeklyFormRef, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);

    const workouts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return workouts;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return null;
  }
}

export const fetchClinicalRegister = async (uid) => {
  try {
    const clinicalRegisterRef = collection(db, 'users', uid, 'clinical_register');
    const q = query(clinicalRegisterRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    const reg = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return reg;
  } catch (error) {
    console.error('Error fetching clinical register:', error);
    return null;
  }
}

export const uploadClinicalRegister = async (uid, text) => {
  try {
    const clinicalRegisterRef = collection(db, 'users', uid, 'clinical_register');
    const newFormRef = doc(clinicalRegisterRef);
    const date = new Date();

    await setDoc(newFormRef, {
        date: date,
        text: text,
    });

  } catch (error) {
    console.error('Error sending clinical register:', error);
  }
}

export const fetchLast7Workouts = async () => {
  while (auth.currentUser == null) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  const uid = auth.currentUser.uid;

  try {
    const workoutRef = collection(db, 'users', uid, 'workouts');
    const q = query(workoutRef, orderBy('date', 'desc'), limit(7));
    const snapshot = await getDocs(q);

    const workouts = snapshot.docs.map(doc => ({
      id: doc.id,
      date: doc.data().date.toDate(),
    }));

    return workouts;
  } catch (error) {
    console.error('Error fetching last 7 workouts:', error);
    return null;
  }
}