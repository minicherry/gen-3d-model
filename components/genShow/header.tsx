import Link from 'next/link'
import styles from './header.module.scss'
import { Package } from 'lucide-react'
const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.backLink}>
        <Package />
        返回
      </Link>
      <div className={styles.headerPlaceholder} />
    </header>
  )
}

export default Header
