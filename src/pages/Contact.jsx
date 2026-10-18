import Layout from "../components/Layout/Layout";
import PageHeading from "../components/PageHeading/PageHeading";
import "./Contact.css";

function Contact() {
  return (
    <Layout>
      <section className="contact-page">

        <PageHeading
          eyebrow="GET IN TOUCH"
          title="Contact Us"
          subtitle="We'd love to hear from you."
        />

        <form className="contact-form">

          <input
            type="text"
            placeholder="Your Name"
          />

          <input
            type="email"
            placeholder="Your Email"
          />

          <input
            type="text"
            placeholder="Subject"
          />

          <textarea
            rows="6"
            placeholder="Your Message"
          ></textarea>

          <button type="submit">
            Send Message
          </button>

        </form>

      </section>
    </Layout>
  );
}

export default Contact;