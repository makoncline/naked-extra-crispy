import Link from "next/link";
import { Layout } from "../components/Layout";
import { Space } from "../components/Space";

const Thanks = () => {
  return (
    <Layout>
      <h1>Thanks for the feedback!</h1>
      <Space size="md" />
      <p>
        A team of dedicated chicken wing enthusiasts carefully reviewed your
        feedback form and are already brainstorming ways to improve our service.
      </p>
      <Space size="sm" />
      <p>Keep on wingin' and keep the feedback coming!</p>
      <Space size="md" />
      <Link href={`/`}>
        <button>Return to the wings</button>
      </Link>
    </Layout>
  );
};

export default Thanks;
