import React, { useEffect, VFC } from 'react';
import styles from './App.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, login, logout } from './features/userSlice';
import { auth } from './firebase';
import Feed from './components/Feed';
import Auth from './components/Auth';

const App: VFC = () => {
  const user = useSelector(selectUser); //Reduxのstoreのuser stateを呼び出す
  const dispatch = useDispatch(); //login logoutをdispatch

  useEffect(() => {
    //onAuthStateChanged→firebaseのuserに対して何らかの変化があった場合に呼び出される
    const unSub = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          }))
      } else {
        dispatch(logout());
      }
    });
    return () => {
      unSub();
    }
  },[dispatch]);

  return (
    <>
      {user.uid ? (
        <div className={styles.app}>
          <Feed />
        </div>
      ) : (
          <Auth />
        )};
    </>
  );
}

export default App;
