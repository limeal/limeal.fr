"use client";

import { useRouter } from "next/navigation";
import Credits from "@/components/atomes/Credits";
import "./style.scss";
import SkillCard from "@/components/atomes/SkillCard";
import TrackHeader from "@/components/atomes/TrackHeader";
import { useState } from "react";

const Page = ({
  params,
  searchParams,
}: {
  params: Record<string, string | string[]>;
  searchParams: URLSearchParams;
}) => {
    const router = useRouter();
    const [orderReference, setOrderReference] = useState<string>(""); // == Order reference [string

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check if order reference is valid before redirecting

        router.push(`/track/${orderReference}`);
    }

  return (
    <>
      <header>
        <TrackHeader />
      </header>
      <main>
        <section className="track-section">
          <h1>Track Your Order</h1>
          <p>
            Track your order from Limeal Freelance Service, completely free and
            updated along. You can collect here the items your ordered at the
            end.
          </p>
          <form onSubmit={onSubmit}>
            <input type="text" placeholder="Type your order reference (ex: 1AB67DB)" value={orderReference} onChange={(e) => setOrderReference(e.target.value)} />
            <button type="submit">Track Now</button>
          </form>
        </section>
        <section className="track-rating">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <SkillCard key={i} name="Skill" star={5} />
            ))}
        </section>
      </main>
      <footer>
        <Credits />
      </footer>
    </>
  );
};

export default Page;
