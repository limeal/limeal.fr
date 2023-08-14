import { BiSolidQuoteAltLeft } from "react-icons/bi";

import "./style.scss";
import Image from "next/image";

const Testimonial = () => {
  return (
    <section className="testimonial" id="testimonial">
      <h1>Our happy customers</h1>
      <BiSolidQuoteAltLeft />
      <div>
        <p>Lime is an outstanding junior programmer with an impressive passion for coding and problem-solving. Their dedication and eagerness to learn are commendable. During their time on our team, Lime quickly adapted to new technologies and contributed valuable insights to our projects.</p>
        <div>
            <Image src="/assets/images/testimonials/1.png" alt="testimonial" />
            <h2>Mark Gosha</h2>
            <span>Project Lead Microsoft</span>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;