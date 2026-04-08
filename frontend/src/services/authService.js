export async function loginUser(email, password) {
  return {
    id: 1,
    fullName: "John Doe",
    email: email,
  };
}

export async function signupUser(fullName, email, password) {
  return {
    id: 2,
    fullName,
    email,
  };
}

export async function changePassword(currentPassword, newPassword) {
  return {
    success: true,
    message: "Password changed successfully.",
  };
}