"use client";
import "./style.scss";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Credits from "@/components/atomes/Credits";
import TrackHeader from "@/components/atomes/TrackHeader";

const Page = ({
  params,
  searchParams,
}: {
  params: Record<string, string | string[]>;
  searchParams: URLSearchParams;
}) => {
  const router = useRouter();
  const [orderReference, setOrderReference] = useState<string>(""); // == Order reference [string
  const [order, setOrder] = useState<Order>({
    id: params.id as string,
    stars: 3,
    files: [
      {
        name: "Specification.pdf",
        type: "pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
      {
        name: "Example.doc",
        type: "doc",
        url: "https://file-examples-com.github.io/uploads/2017/02/file-sample_1MB.docx",
      }
    ],
    events: []
  }); // == Order [object

  return (
    <>
      <header>
        <TrackHeader />
      </header>
      <main>
        <section className="left-section">
          <h1>Order N°{params.id}</h1>
          <ul>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <li key={index}>
                  <Image
                    src={index < order.stars ? "/assets/images/icons/fill_star.png" : "/assets/images/icons/empty_star.png"}
                    width={30}
                    height={30}
                    alt="ES"
                  />
                </li>
              ))}
          </ul>
          <p>
            Check the current status of your order, from processing to the
            delivery of your file this panel is made to provide you all the
            latest information about your order
          </p>
          <ul className="files">
              {order.files.map((file, index) => (
                  <li key={index} onClick={() => window.open(file.url, "_blank")}>
                      <Image src={`/assets/images/icons/${file.type}.png`} width={64} height={64} alt="file" />
                      <p>{file.name}</p>
                  </li>
                ))}
          </ul>
        </section>
        <section className="right-section"></section>
      </main>
      <footer>
        <Credits />
      </footer>
    </>
  );
};

export default Page;
