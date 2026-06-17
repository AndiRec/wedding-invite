import { useState } from "react";
import { createRsvp } from "@/lib/rsvp-data";
import { t } from "@/lib/i18n";

type FormState = {
  name: string;
  attending: string; // "yes" | "no" | ""
  guests: string;
  message: string;
};

export default function RsvpForm({ initialName = "" }: { initialName?: string }) {
  const [formData, setFormData] = useState<FormState>({
    name: initialName,
    attending: "",
    guests: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await createRsvp({
        name: formData.name,
        attending: formData.attending === "yes",
        guestCount: Number(formData.guests) || 1,
        message: formData.message,
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="rsvp-thankyou">
        <h3>
          {t.invite.thankYou}, {formData.name}!
        </h3>
        <p>
          {formData.attending === "yes"
            ? t.invite.thankYouAttend
            : t.invite.thankYouDecline}
        </p>
      </div>
    );
  }

  const guestOptions = [1, 2, 3, 4];

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder={t.invite.fullName}
        className="rsvp-input"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <select
        name="attending"
        className="rsvp-input"
        value={formData.attending}
        onChange={handleChange}
        required
      >
        <option value="">{t.invite.willAttend}</option>
        <option value="yes">{t.invite.yesAttend}</option>
        <option value="no">{t.invite.noAttend}</option>
      </select>

      <select
        name="guests"
        className="rsvp-input"
        value={formData.guests}
        onChange={handleChange}
        required
      >
        <option value="">{t.invite.numGuests}</option>
        {guestOptions.map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? t.invite.guest : t.invite.guests}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        placeholder={t.invite.messagePlaceholder}
        className="rsvp-input rsvp-textarea"
        value={formData.message}
        onChange={handleChange}
      />

      {status === "error" && <p className="rsvp-error">{t.invite.rsvpError}</p>}

      <button type="submit" className="rsvp-button" disabled={status === "sending"}>
        {status === "sending" ? t.invite.sending : t.invite.sendRsvp}
      </button>
    </form>
  );
}
