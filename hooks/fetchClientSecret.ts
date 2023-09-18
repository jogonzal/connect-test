export const fetchClientSecret = async (accountId: string): Promise<string> => {
  try {
    const apiResponse = await fetch("/api/create-account-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: accountId,
      }),
    });

    if (!apiResponse.ok) {
      let errorText: string | undefined = undefined;
      try {
        const error = await apiResponse.json();
        errorText = error?.error;
      } catch (e) {
        // ignore
      }
      throw new Error(
        `Unexpected response code ${apiResponse.status}. ${
          errorText ? `Internal error: ${errorText}` : ""
        }`,
      );
    }

    const json = await apiResponse.json();
    return json.client_secret;
  } catch (error) {
    console.error(`Failed to get client secret`, error);
    throw error;
  }
};
