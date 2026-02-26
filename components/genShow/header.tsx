import Link from 'next/link'
import styles from './header.module.scss'
import { House } from 'lucide-react'
const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.backLink}>
        <House />
        返回
      </Link>
      <div className={styles.headerPlaceholder} />
    </header>
  )
}

export default Header
