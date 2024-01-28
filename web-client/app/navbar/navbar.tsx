'use client';

import Image from 'next/image';
import styles from './navbar.module.css';
import Link from 'next/link';
import SignIn from './sign-in';
import { onAuthStateChangedHelper } from '../firebase/firebase';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import Upload from './upload';

export default function Navbar() {
  // Init user state
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unSubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    return () => unSubscribe();
  }, []);

  return (
    <nav className={styles.nav}>
      <Link href="/">
        <span className={styles.logoContainer}>
          <Image
            width={90}
            height={20}
            src="/youtube-logo.svg"
            alt="Youtube Logo"
          />
        </span>
      </Link>
      {user && <Upload />}
      <SignIn user={user} />
    </nav>
  );
}
