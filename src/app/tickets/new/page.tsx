import { redirect } from "next/navigation";
import NewTicketForm from "./TicketForm";
import { getCurrentUser } from "@/lib/current-user";

const NewTicket = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login')
  }

  return (
     <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <NewTicketForm />
     </div>
  )
}

export default NewTicket