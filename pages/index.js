import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.scss'
import { useState, useEffect } from 'react';
import PouchDB from 'pouchdb';

const db = new PouchDB('volcano');


export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await db.allDocs({ include_docs: true });
        
        // organize messages by date (most recent first)
        const docs = result.rows.map(row => row.doc);
        docs.sort((a, b) => b.date - a.date);
        setMessages(docs);

      } catch (err) {
        setIsError(true);
      }
      setIsLoading(false);
    };
    fetchData();
  }
  , []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // make sure message is not empty
    if (message.trim() === '') {
      setIsLoading(false);
      return;
    }

    try {
      const result = await db.post({
        user: user,
        message: message,
        createdAt: new Date().toISOString()
      });
      setMessages([...messages, result]);
      setMessage('');
    } catch (err) {
      setIsError(true);
    }
    setIsLoading(false);
  }

  // update messages on changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await db.allDocs({ include_docs: true });
        setMessages(result.rows.map(row => row.doc));
      } catch (err) {
        setIsError(true);
      }
      setIsLoading(false);
    };
    fetchData();
  }
  , [messages]);

  const deleteall = async () => {
    setIsLoading(true);
    try {
      const result = await db.allDocs({ include_docs: true });
      result.rows.map(row => db.remove(row.doc));
      setMessages([]);
    } catch (err) {
      setIsError(true);
    }
    setIsLoading(false);
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <button onClick={deleteall}>Delete All</button>
        {isError && <p>Error :( Please try again</p>}
        
      <div className={styles.messages}>
        <dl>
          {messages.map(message => (
            <div key={message.createdAt}>
              <dt>{message.user}</dt>
              <dd>{message.message}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={styles.controls}>
          <form onSubmit={handleSubmit}>
            <input placeholder='username' type="text" value={user} onChange={e => setUser(e.target.value)} className={styles.name} />
            <br />
            <input placeholder='message' type="text" value={message} onChange={e => setMessage(e.target.value)} />
            <button type="submit">Submit</button>
          </form>
        </div>
    </div>
  )


}
