import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Chat } from "@/components/chat";
import styles from "./page.module.scss";

export default function ChatPage() {
  return (
    <main className={styles.chatPage}>
      <div className={styles.pageInner}>
        <nav className={styles.topNav}>
          <div className={styles.navInner}>
            <div className={styles.navLeft}>
              <Link href={"/"}>Next.js Supabase Starter</Link>
              <div className={styles.deployWrap}>
                <DeployButton />
              </div>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <Suspense
          fallback={
            <div className={styles.chatFallback} />
          }
        >
          <Chat />
        </Suspense>
      </div>
    </main>
  );
}
