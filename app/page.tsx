"use client"
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <div className="flex items-center justify-center h-screen">
      <Button onClick={() => console.log("HELLO LEAF-N-GO")} className="bg-blue-500 text-white">
        Hello, Leaf-N-Go!
      </Button>
      <Card title="Card Title" description="here is a description for this card"></Card>
    </div>
      </main>
      <footer className={styles.footer}>
        
      </footer>
    </div>
  );
}
