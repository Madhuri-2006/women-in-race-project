import Layout from "../components/Layout/Layout";
import "./Contact.css";

function Contact() {
  return (
    <Layout>
      <section className="contact-page">

        <h1>Contact Us</h1>

        <p className="contact-subtitle">
          We'd love to hear from you.
        </p>

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