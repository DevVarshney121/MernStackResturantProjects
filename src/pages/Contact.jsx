
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock3,
  Send,
  CheckCircle2,
} from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import "../styles/contact.css";

const API = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
).replace(/\/+$/, "");

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitted(false);
    setError("");
    setBusy(true);

    // Save the form reference before the async request.
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      const response = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          subject: form.get("subject"),
          message: form.get("message"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Message could not be sent.");
      }

      // Reset the form only after a successful server response.
      formElement.reset();
      setSubmitted(true);
    } catch (err) {
      setError(
        err.message || "Could not connect to the server. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-shell contact-page">
      <section className="page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">LET'S TALK</p>
          <h1>
            We'd love to
            <br />
            <em>hear from you.</em>
          </h1>
          <p>
            Questions, plans, or just want to say hello? Our table is always
            open.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container contact-layout">
          <div className="contact-details">
            <p className="eyebrow">FIND YOUR WAY TO US</p>
            <h2>
              Come on <em>over.</em>
            </h2>
            <p className="contact-lead">
              Drop us a note or stop by. We can't wait to welcome you.
            </p>

            <div className="contact-detail">
              <span><MapPin size={20} /></span>
              <div>
                <strong>Our address</strong>
                <p>24 Garden Lane, Your City, IN 110001</p>
              </div>
            </div>

            <div className="contact-detail">
              <span><Phone size={20} /></span>
              <div>
                <strong>Give us a call</strong>
                <p>+91 98765 43210</p>
              </div>
            </div>

            <div className="contact-detail">
              <span><Mail size={20} /></span>
              <div>
                <strong>Send an email</strong>
                <p>hello@biteandbloom.example</p>
              </div>
            </div>

            <div className="contact-detail">
              <span><Clock3 size={20} /></span>
              <div>
                <strong>Opening hours</strong>
                <p>
                  Tue–Sun: 12 PM–10 PM
                  <br />
                  Monday: Closed
                </p>
              </div>
            </div>

            <div className="contact-map-placeholder">
              <MapPin size={25} />
              <span>
                <strong>Right around the corner</strong>
                <small>
                  Replace this demo location with your restaurant address.
                </small>
              </span>
            </div>
          </div>

          <form className="contact-form form-card" onSubmit={handleSubmit}>
            <p className="eyebrow">SEND A MESSAGE</p>
            <h2>
              What's on your <em>mind?</em>
            </h2>
            <p className="form-intro">
              Fill this out and send your message to the restaurant.
            </p>

            {submitted && (
              <div className="form-success" role="status">
                <CheckCircle2 size={18} />
                Thanks! Your message has been saved successfully.
              </div>
            )}

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-row">
              <label>
                Full name
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
            </div>

            <label>
              What is this about?
              <select name="subject" defaultValue="General question">
                <option>General question</option>
                <option>Table reservation</option>
                <option>Private gathering</option>
                <option>Feedback</option>
              </select>
            </label>

            <label>
              Your message
              <textarea
                name="message"
                rows="5"
                placeholder="Write your message..."
                required
              />
            </label>

            <button
              className="button form-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? "Sending…" : "Send message"}
              <Send size={17} />
            </button>

            <small className="form-disclaimer">
              Your message is submitted to the restaurant backend.
            </small>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Contact;
cd 