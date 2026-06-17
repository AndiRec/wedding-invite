import { useEffect } from "react";
import Envelope from "@/components/invitation/Envelope";

// Public landing page (/) — the wedding invitation.
// Tapping the wax seal opens the envelope and reveals the full invite + RSVP.
const Invitation = () => {
  // Release the seating app's global no-scroll lock (html/body/#root are
  // height:100dvh; overflow:hidden) while the long invitation is mounted.
  useEffect(() => {
    document.documentElement.classList.add("invite-scroll");
    return () => document.documentElement.classList.remove("invite-scroll");
  }, []);

  return <Envelope />;
};

export default Invitation;
