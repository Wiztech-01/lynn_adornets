import React from 'react';

const Contact = () => {
  return (
    <div className="contact-page">
      <h2>Contact Us</h2>
      <form className="contact-form">
        <input type="text" placeholder="Full Name" required />
        <input type="email" placeholder="Email" required />
        <textarea placeholder="Your Message..." rows="5"></textarea>
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;
