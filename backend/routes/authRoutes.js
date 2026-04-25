import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient"); // ✅ fixed

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const user = data.user;

      if (!user) {
        alert("Signup failed.");
        return;
      }

      // 2️⃣ Insert into USERS table
      const { error: userError } = await supabase
        .from("users")
        .insert([
          {
            user_id: user.id,   // matches UUID
            name: name,
            email: email,
            role: role,         // must be 'patient' or 'doctor'
          },
        ]);

      if (userError) {
        alert("Error inserting into users table: " + userError.message);
        return;
      }

      // 3️⃣ Insert into role-based table
      if (role === "doctor") {
        const { error: doctorError } = await supabase
          .from("doctors")
          .insert([
            {
              user_id: user.id,
            },
          ]);

        if (doctorError) {
          alert("Error inserting into doctors table: " + doctorError.message);
          return;
        }
      } else {
        const { error: patientError } = await supabase
          .from("patients")
          .insert([
            {
              user_id: user.id,
            },
          ]);

        if (patientError) {
          alert("Error inserting into patients table: " + patientError.message);
          return;
        }
      }

      alert("Signup successful!");

      // 4️⃣ Navigate based on role
      if (role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/patient"); // make sure your route matches this
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input
        type="text"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <select onChange={(e) => setRole(e.target.value)} value={role}>
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
      </select>

      <button type="submit">Sign Up</button>
    </form>
  );
}