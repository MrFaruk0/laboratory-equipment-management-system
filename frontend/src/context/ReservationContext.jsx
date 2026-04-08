import { createContext, useState, useEffect } from "react";
import { getReservations } from "../services/reservationService";

export const ReservationContext = createContext();

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    async function loadReservations() {
      const data = await getReservations();
      setReservations(data);
    }

    loadReservations();
  }, []);

  const addReservation = (newReservation) => {
    setReservations((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ...newReservation,
      },
    ]);
  };

  return (
    <ReservationContext.Provider value={{ reservations, addReservation }}>
      {children}
    </ReservationContext.Provider>
  );
}