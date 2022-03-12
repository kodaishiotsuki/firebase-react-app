import React, { useState } from 'react'
import styles from "./TweetInput.module.css";
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { auth, db, storage } from "../firebase"
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import { Avatar, Button, IconButton } from '@material-ui/core';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

const TweetInput:React.FC = () => {
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMessage, setTweetMessage] = useState("");

  //画像ボタンクリック後のイベント関数
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      e.target.value = "";
    };
  };

  //送信ボタンクリック後のイベント関数
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    //ブラウザの自動リフレッシュ制御
    e.preventDefault();
    //テキストと画像が存在する場合とテキストのみの場合
    if (tweetImage) {
      //画像をstorageに保存
      //file名生成
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImage.name;
      //storageに保存
      const uploadTweetImage = uploadBytesResumable(
        ref(storage, `images/${fileName}`),
        tweetImage //fileオブジェクトを指定
      );
      //storageに対してstateの変化があった時の後処理
      uploadTweetImage.on(
        "state_changed",
        //進捗状況
        () => { },
        //エラーハンドリング
        (err) => {
          alert(err.message);
        },
        //正常終了した場合
        async () => {
          //firestoreに投稿データをアップロード
          await getDownloadURL(ref(storage, `images/${fileName}`)).then(
            async (url) => {
              addDoc(collection(db, "posts"), {
                avatar: user.photoUrl,
                image: url,
                text: tweetMessage,
                timestamp: serverTimestamp(),
                username: user.displayName,
              });
            }
          );
        }
      );
    } else {
      //firebase
      addDoc(collection(db, "posts"), {
        avatar: user.photoUrl,
        image: "",
        text: tweetMessage,
        timestamp: serverTimestamp(),
        username: user.displayName,
      });
    }
    setTweetImage(null);
    setTweetMessage("");
  };
  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            className={styles.tweet_input}
            placeholder="What's happening?"
            type="text"
            autoFocus
            value={tweetMessage}
            onChange={(e) => setTweetMessage(e.target.value)}
          />
          <IconButton>
            <label >
              <AddAPhotoIcon
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                type="file"
                className={styles.tweet_hiddenIcon}
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          disabled={!tweetMessage}
          className={
            tweetMessage ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
}

export default TweetInput