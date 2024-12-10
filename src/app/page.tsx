import ReadingComponent from "../components/ReadingComponent";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ReadingComponent textToRead="Welcome to Read fun! This is a sample text for you to read aloud. " />
    </main>
  )
}
