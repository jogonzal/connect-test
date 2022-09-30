export const fetchClientSecret = async (accountId: string): Promise<string> => {
  try {
    const response = await fetch("/api/create-account-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: accountId,
      }),
    });
    const json = await response.json();
    console.log(json);

    if (!response.ok) {
      console.error(
        json.error || "There was an error getting the client secret."
      );
      throw new Error("Failed to fetch");
    }

    return json.client_secret;
  } catch (error) {
    console.error(`Failed to get client secret`, error);
    throw error;
  }
};
