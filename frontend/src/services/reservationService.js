import { mockReservations } from "../data/mockData";

export async function getReservations() {
  return mockReservations;
}

export async function createReservation(reservationData) {
  return {
    id: Date.now(),
    ...reservationData,
  };
}