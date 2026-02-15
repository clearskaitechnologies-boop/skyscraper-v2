import React from "react";

import TopNav from "../components/TopNav";

export default function Signup() {
  return (
    <div>
      <TopNav />
      <main style={{ padding: 24 }}>
        <h1>Sign up</h1>
        <p>Tell us about your intent and we'll tailor a demo.</p>
        <form>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
          <br />
          <button type="submit">Request demo</button>
        </form>
      </main>
    </div>
  );
}
