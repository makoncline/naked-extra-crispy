import Link from "next/link";
import { Layout } from "../components/Layout";
import { Button } from "@/components/ui/button";

const Thanks = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-black">Thanks for the feedback!</h1>
      <div className="h-8" />
      <p>
        A team of dedicated chicken wing enthusiasts carefully reviewed your
        feedback form and are already brainstorming ways to improve our service.
      </p>
      <div className="h-4" />
      <p>Keep on wingin&apos; and keep the feedback coming!</p>
      <div className="h-8" />
      <Button asChild>
        <Link href={`/`}>Return to the wings</Link>
      </Button>
    </Layout>
  );
};

export default Thanks;
