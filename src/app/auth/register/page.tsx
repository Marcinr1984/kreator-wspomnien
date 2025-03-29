"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Hasła nie są takie same");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-center text-cyan-600 mb-4">
        Utwórz swoje konto
      </h1>
      <p className="text-center text-sm text-gray-700 mb-6">
        Dołącz do Keeper, aby zacząć zachować własne dziedzictwo, aby stać się administratorem Opiekuna istniejącego pomnika i wiele więcej!
      </p>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Twoje imię na pierwszym miejscu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Twoje imię i nazwisko"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Twoje nazwisko <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Twoje nazwisko"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adres e-mail <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Adres e-mail"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hasło <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Hasło"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ponowne wprowadzenie hasła <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ponowne wprowadzenie hasła"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded font-semibold"
        >
          Utwórz konto
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-4 text-center">
        Klikając na założenie konta, zgadzasz się na <span className="underline">Regulamin</span> i potwierdzasz, że masz powyżej 13 roku życia
      </p>
      <p className="text-sm mt-4 text-center">
        Czy masz już konto? <Link href="/auth/login" className="text-cyan-600 font-medium hover:underline">Zaloguj się</Link>
      </p>
    </div>
  );
}